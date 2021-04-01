enum KeeperProcessStatus {

    /**
     * Keeper default status
     */
    PENDING = 'PENDING',

    /**
     * Keeper has started and is still in progress and not completed yet
     */
    IN_PROGRESS = 'IN_PROGRESS',

    /**
     * Keeper has completed successfully and there was no error or issue in completing the cloud backup
     */
    COMPLETED = 'COMPLETED',

    /**
     * Keeper was started but did not complete and there was an error in completing cloud backup
     */
     FAILED = 'FAILED',
  }

export default KeeperProcessStatus

