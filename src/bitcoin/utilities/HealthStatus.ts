import config from "../Config";
const HEXA_HEALTH = config.HEALTH_STATUS.HEXA_HEALTH;
const ENTITY_HEALTH = config.HEALTH_STATUS.ENTITY_HEALTH;
const TIME_SLOTS = config.HEALTH_STATUS.TIME_SLOTS;

export default class HealthStatus {
  private counter: {
    good: number;
    bad: number;
    ugly: number;
  };

  constructor () {
    this.counter = {
      good: 0,
      bad: 0,
      ugly: 0,
    };
  }

  public appHealthStatus = (
    qaTimestamp: number,
    secureTimestamp: number,
    shares?: [
      { shareId: string; updatedAt: number },
      { shareId: string; updatedAt: number },
      { shareId: string; updatedAt: number }
    ],
    mnemonicTimestamp?: number,
  ) => {
    let overallStatus = HEXA_HEALTH.STAGE1;
    const qaStatus = this.qaHealthStatus( qaTimestamp );
    const secureAcStatus = this.secureAccountHealthStatus( secureTimestamp );

    let mnemonicStatus: string = ENTITY_HEALTH.STAGE1;
    let sharesData: any;
    let sharesInfo: any = ENTITY_HEALTH.STAGE1;
    let sharesStatus: string = ENTITY_HEALTH.STAGE1;

    if ( shares && mnemonicTimestamp ) {
      throw new Error(
        "Both shares and mnemonic timestamps can not be provided simultaneously",
      );
    } else if ( shares ) {
      sharesData = this.shareHealthStatus( shares );
      sharesInfo = sharesData.sharesInfo;
      sharesStatus = sharesData.sharesStage;
    } else if ( mnemonicTimestamp ) {
      mnemonicStatus = this.mnemonicHealthStatus( mnemonicTimestamp );
    } else {
      throw new Error( "Neither shares nor mnemonic timestamps is provided" );
    }

    if ( this.counter.ugly >= 2 ) {
      overallStatus = HEXA_HEALTH.STAGE1;
    } else if ( this.counter.ugly === 1 ) {
      overallStatus = HEXA_HEALTH.STAGE2;
    } else if ( this.counter.bad > 1 ) {
      overallStatus = HEXA_HEALTH.STAGE3;
    } else if ( this.counter.bad === 1 ) {
      overallStatus = HEXA_HEALTH.STAGE4;
    } else if ( this.counter.good === 3 ) {
      overallStatus = HEXA_HEALTH.STAGE5;
    }

    if ( shares ) {
      return {
        sharesInfo,
        sharesStatus,
        qaStatus,
        secureAcStatus,
        overallStatus,
      };
    } else {
      return {
        mnemonicStatus,
        qaStatus,
        secureAcStatus,
        overallStatus,
      };
    }
  }

  private mnemonicHealthStatus = ( time: number ) => {
    let mnemonicStage = ENTITY_HEALTH.STAGE1;
    const delta = Math.abs( Date.now() - time );
    const numberOfDays = Math.round( delta / ( 60 * 60 * 24 * 1000 ) );
    if ( numberOfDays > 2 * TIME_SLOTS.MNEMONIC_SLOT ) {
      mnemonicStage = ENTITY_HEALTH.STAGE1;
      this.counter.ugly++;
    } else if (
      numberOfDays > TIME_SLOTS.MNEMONIC_SLOT &&
      numberOfDays <= 2 * TIME_SLOTS.MNEMONIC_SLOT
    ) {
      mnemonicStage = ENTITY_HEALTH.STAGE2;
      this.counter.bad++;
    } else if ( numberOfDays <= TIME_SLOTS.MNEMONIC_SLOT ) {
      mnemonicStage = ENTITY_HEALTH.STAGE3;
      this.counter.good++;
    }
    return mnemonicStage;
  }

  private qaHealthStatus = ( time: number ) => {
    let qaStage = ENTITY_HEALTH.STAGE1;
    const delta = Math.abs( Date.now() - time );
    const numberOfDays = Math.round( delta / ( 60 * 60 * 24 * 1000 ) );

    if ( numberOfDays > TIME_SLOTS.SHARE_SLOT2 ) {
      qaStage = ENTITY_HEALTH.STAGE1;
      this.counter.ugly++;
    } else if (
      numberOfDays > TIME_SLOTS.SHARE_SLOT1 &&
      numberOfDays <= TIME_SLOTS.SHARE_SLOT2
    ) {
      qaStage = ENTITY_HEALTH.STAGE2;
      this.counter.bad++;
    } else if ( numberOfDays <= TIME_SLOTS.SHARE_SLOT1 ) {
      qaStage = ENTITY_HEALTH.STAGE3;
      this.counter.good++;
    }
    return qaStage;
  }

  private secureAccountHealthStatus = ( time: number ) => {
    let secureAcStage = ENTITY_HEALTH.STAGE1;
    const delta = Math.abs( Date.now() - time );
    const numberOfDays = Math.floor( delta / ( 60 * 60 * 24 * 1000 ) );
    if ( numberOfDays > TIME_SLOTS.SHARE_SLOT2 ) {
      secureAcStage = ENTITY_HEALTH.STAGE1;
      this.counter.ugly++;
    } else if (
      numberOfDays > TIME_SLOTS.SHARE_SLOT1 &&
      numberOfDays <= TIME_SLOTS.SHARE_SLOT2
    ) {
      secureAcStage = ENTITY_HEALTH.STAGE2;
      this.counter.bad++;
    } else if ( numberOfDays <= TIME_SLOTS.SHARE_SLOT2 ) {
      secureAcStage = ENTITY_HEALTH.STAGE3;
      this.counter.good++;
    }
    return secureAcStage;
  }


  private shareHealthStatus = (
    shares: [
      { shareId: string; updatedAt: number },
      { shareId: string; updatedAt: number },
      { shareId: string; updatedAt: number }
    ],
  ) => {
    let sharesStage = ENTITY_HEALTH.STAGE1;
    const sharesInfo = [];
    let shareUglyCount = 0;
    let shareBadCount = 0;
    let shareGoodCount = 0;
    for ( let itr = 0; itr < shares.length; itr++ ) {
      const obj = shares[ itr ];
      sharesInfo.push( {
        shareId: obj.shareId,
        shareStage: ENTITY_HEALTH.STAGE1,
      } );
    }
    const delta: number[] = new Array( 3 );
    const numberOfDays: number[] = new Array( 3 );
    for ( let i = 0; i < delta.length; i++ ) {
      const obj = shares[ i ];
      delta[ i ] = Math.abs( Date.now() - obj.updatedAt );
    }
    for ( let i = 0; i < numberOfDays.length; i++ ) {
      numberOfDays[ i ] = Math.floor( delta[ i ] / ( 60 * 60 * 24 * 1000 ) );
      const obj = sharesInfo[ i ];
      if ( numberOfDays[ i ] > TIME_SLOTS.SHARE_SLOT2 ) {
        obj.shareStage = ENTITY_HEALTH.STAGE1;
        shareUglyCount++;
      } else if (
        numberOfDays[ i ] > TIME_SLOTS.SHARE_SLOT1 &&
        numberOfDays[ i ] <= TIME_SLOTS.SHARE_SLOT2
      ) {
        obj.shareStage = ENTITY_HEALTH.STAGE2;
        shareBadCount++;
      } else if ( numberOfDays[ i ] <= TIME_SLOTS.SHARE_SLOT1 ) {
        obj.shareStage = ENTITY_HEALTH.STAGE3;
        shareGoodCount++;
      }
    }
    if ( shareUglyCount >= 2 ) {
      sharesStage = ENTITY_HEALTH.STAGE1;
      this.counter.ugly++;
    } else if ( shareGoodCount > 2 ) {
      sharesStage = ENTITY_HEALTH.STAGE3;
      this.counter.good++;
    } else if (
      shareGoodCount === 2 &&
      ( shareBadCount === 1 || shareUglyCount === 1 )
    ) {
      sharesStage = ENTITY_HEALTH.STAGE2;
      this.counter.bad++;
    } else if (
      shareBadCount === 2 &&
      ( shareGoodCount === 1 || shareUglyCount === 1 )
    ) {
      sharesStage = ENTITY_HEALTH.STAGE1;
      this.counter.ugly++;
    } else if ( shareBadCount >= 2 ) {
      sharesStage = ENTITY_HEALTH.STAGE2;
      this.counter.ugly++;
    }
    return { sharesStage, sharesInfo };
  }
}

/////////// SMOKE TEST ///////////////

// const healthStatus = new HealthStatus();
// console.log(
//   "Share based:",
//   healthStatus.appHealthStatus(1555725600000, 1555725600000, [
//     {
//       shareID:
//         "856e8ade9c4ec1edca1ec84f8674af25d52e4270842c365eb48e73ed35702f86",
//       updatedAt: 1555725600000,
//     },
//     {
//       shareID:
//         "856e8ade9c4ec1edca1ec84f8674af25d52e4270842c365eb48e73ed35702f86",
//       updatedAt: 1555725600000,
//     },
//     {
//       shareID:
//         "856e8ade9c4ec1edca1ec84f8674af25d52e4270842c365eb48e73ed35702f86",
//       updatedAt: 1555725600000,
//     },
//   ]),
// );

// console.log(
//   "Mnemonic based:",
//   healthStatus.appHealthStatus(
//     1555725600000,
//     1555725600000,
//     null,
//     1555725600000,
//   ),
// );
