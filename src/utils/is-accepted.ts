import nm from "nanomatch";

export const isAccepted = (accepted: string | string[], publicKey: string): boolean => {
    if (!Array.isArray(accepted)) {
        accepted = [accepted];
    }

    if (!accepted.length) {
        return true;
    }

    for (const pk of accepted) {
        try {
            if (nm.isMatch(publicKey, pk)) {
                return true;
            }
        } catch (error) {
            return false;
        }
    }

    return false;
};
