enum LevelStatus {

    /**
     * Level has not started yet
     */
    PENDING = 'PENDING',

    /**
     * Level has started and is still in progress and not completed yet
     */
    IN_PROGRESS = 'IN_PROGRESS',

    /**
     * Level has completed successfully and there was no error or issue in completing
     */
    COMPLETED = 'COMPLETED',
    /**
     * Level was started but did not complete and there was an error in completing Levels
     */
     FAILED = 'FAILED',
  }

export default LevelStatus
