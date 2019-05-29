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
    console.log( "Constructor Executed" );
    console.log( this.counter )
  }

  public appHealthStatus = (
    qaTimestamp: number,
    secureTimestamp: number,
    shares: [
      { shareId: string; updatedAt: number },
      { shareId: string; updatedAt: number },
      { shareId: string; updatedAt: number }
    ],
    mnemonicTimestamp: number,
    backupType: string,
  ): {
    backupType: string;
    sharesInfo: Array<{ shareId: number; shareStage: string }>;
    sharesStatus: string;
    mnemonicStatus: string;
    qaStatus: string;
    secureAcStatus: string;
    overallStatus: string;
  } => {
    console.log( { qaTimestamp, secureTimestamp, shares, mnemonicTimestamp, backupType } );
    console.log( { counter: this.counter } )


    let overallStatus: string = HEXA_HEALTH.STAGE1;
    const qaRes = this.qaHealthStatus( qaTimestamp );
    const qaStatus = qaRes.qaStage;
    const saRes = this.secureAccountHealthStatus( secureTimestamp );
    const secureAcStatus = saRes.secureAcStage;

    let mnemonicStatus = ENTITY_HEALTH.STAGE1;
    let sharesData: any;
    let sharesInfo: any;
    let sharesStatus: string = ENTITY_HEALTH.STAGE1;

    if ( backupType === "mnemonic" ) {
      const mnemonicRes = this.mnemonicHealthStatus( mnemonicTimestamp );
      mnemonicStatus = mnemonicRes.mnemonicStage;
    } else {
      sharesData = this.shareHealthStatus( shares );
      sharesInfo = sharesData.sharesInfo;
      sharesStatus = sharesData.sharesStage;
    }

    console.log( { counter: this.counter } );

    if ( this.counter.ugly >= 2 ) {
      overallStatus = HEXA_HEALTH.STAGE1;
      console.log( "1" );
    } else if ( this.counter.ugly === 1 ) {
      console.log( "2.." );
      overallStatus = HEXA_HEALTH.STAGE2;
    } else if ( this.counter.bad > 1 ) {
      overallStatus = HEXA_HEALTH.STAGE3;
    } else if ( this.counter.bad === 1 ) {
      overallStatus = HEXA_HEALTH.STAGE4;
    } else if ( this.counter.good === 3 ) {
      overallStatus = HEXA_HEALTH.STAGE5;
    }

    console.log( { overallStatus, } );


    return {
      backupType,
      sharesInfo,
      sharesStatus,
      mnemonicStatus,
      qaStatus,
      secureAcStatus,
      overallStatus,
    };
  }

  private mnemonicHealthStatus = ( time: number ): { mnemonicStage: string } => {
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
    return { mnemonicStage };
  }

  private qaHealthStatus = ( time: number ): { qaStage: string } => {
    let qaStage: string = ENTITY_HEALTH.STAGE1;
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
    return { qaStage };
  }

  private secureAccountHealthStatus = (
    time: number,
  ): { secureAcStage: string } => {
    let secureAcStage = ENTITY_HEALTH.STAGE1;
    const delta = Math.abs( Date.now() - time );
    const numberOfDays = Math.floor( delta / ( 60 * 60 * 24 * 1000 ) );
    if ( numberOfDays > TIME_SLOTS.SHARE_SLOT2 ) {
      console.log( { numberOfDays } );
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
    return { secureAcStage };
  }

  private shareHealthStatus = (
    shares: [
      { shareId: string; updatedAt: number },
      { shareId: string; updatedAt: number },
      { shareId: string; updatedAt: number }
    ],
  ): {
    sharesStage: string;
    sharesInfo: Array<{ shareId: number; shareStage: string }>;
  } => {
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
      // console.log(numberOfDays[i], TIME_SLOTS.SHARE_SLOT2);
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
        //  console.log("executing");
        obj.shareStage = ENTITY_HEALTH.STAGE3;
        shareGoodCount++;
      }
    }
    // console.log(sharesInfo);
    // console.log(numberOfDays);

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
//   healthStatus.appHealthStatus(
//     1557824327389,
//     0,
//     [
//       {
//         shareId: "0dsdgfdg",
//         updatedAt: 0,
//       },
//       {
//         shareId: "0dsfdsfsd",
//         updatedAt: 0,
//       },
//       {
//         shareId: "0",
//         updatedAt: 0,
//       },
//     ],
//     0,
//     "share",
//   ),
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
