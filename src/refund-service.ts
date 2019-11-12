import { app } from "@arkecosystem/core-container";
import { Database, EventEmitter, Logger } from "@arkecosystem/core-interfaces";
import { expirationCalculator } from "@arkecosystem/core-utils";
import { Identities, Managers, Transactions } from "@arkecosystem/crypto";
import { isAccepted } from "./utils/is-accepted";

import chunk from "lodash.chunk";

export class RefundService {
    public options = undefined;

    public constructor(options) {
        this.options = options;
    }

    public listen() {
        const databaseService = app.resolvePlugin<Database.IDatabaseService>("database");
        const emitter = app.resolvePlugin<EventEmitter.EventEmitter>("event-emitter");
        const logger = app.resolvePlugin<Logger.ILogger>("logger");

        emitter.on("block.applied", async block => {
            this.configureManager(block.height);

            if (block.height % this.options.interval === 0) {
                const locks = (await databaseService.connection.transactionsRepository.getOpenHtlcLocks()).filter(
                    tx => {
                        return tx.open && expirationCalculator.calculateLockExpirationStatus(tx.asset.lock.expiration);
                    },
                );

                logger.info(`[REFUNDS] Found ${locks.length} expired HTLC locks`);

                const senderKeys = Identities.Keys.fromPassphrase(this.options.passphrase as string);
                let nonce = databaseService.walletManager.getNonce(senderKeys.publicKey).plus(1);

                const transactions = [];

                for (const lock of locks) {
                    if (isAccepted(this.options.publicKeys, lock.senderPublicKey)) {
                        transactions.push(
                            Transactions.BuilderFactory.htlcRefund()
                                .nonce(nonce.toFixed())
                                .senderPublicKey(senderKeys.publicKey)
                                .htlcRefundAsset({ lockTransactionId: lock.id })
                                .sign(this.options.passphrase as string)
                                .build(),
                        );

                        nonce = nonce.plus(1);
                    }
                }

                if (transactions.length) {
                    logger.info(`[REFUNDS] Sending ${transactions.length} HTLC refunds`);
                }

                for (const batch of chunk(transactions, 40)) {
                    app.resolvePlugin("p2p")
                        .getMonitor()
                        .broadcastTransactions(batch);
                }
            }
        });
    }

    private configureManager(height: number) {
        Managers.configManager.setFromPreset("devnet");

        if (!Managers.configManager.getHeight()) {
            Managers.configManager.setHeight(height);
        }
    }
}
