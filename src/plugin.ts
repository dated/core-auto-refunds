import { Container, Logger } from "@arkecosystem/core-interfaces";
import { defaults } from "./defaults";
import { RefundService } from "./refund-service";

export const plugin: Container.IPluginDescriptor = {
    pkg: require("../package.json"),
    defaults,
    alias: "auto-refunds",
    async register(container: Container.IContainer, options) {
        if (!options.enabled) {
            return;
        }

        const logger = container.resolvePlugin<Logger.ILogger>("logger");

        options = {
            ...this.defaults,
            ...options,
        };

        if (!options.passphrase) {
            logger.error("[REFUNDS] You need to configure a passphrase");
            return;
        }

        logger.info("[REFUNDS] Started 'auto-refunds' plugin");

        const refundService = new RefundService(options);
        refundService.listen();
    },

    async deregister(container: Container.IContainer, options) {
        const logger = container.resolvePlugin<Logger.ILogger>("logger");
        logger.info("[REFUNDS] Stopped 'auto-refunds' plugin");
    },
};
