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
    shares: [
      { shareId: string; updatedAt: number },
      { shareId: string; updatedAt: number },
      { shareId: string; updatedAt: number },
      { shareId: string; updatedAt: number },
      { shareId: string; updatedAt: number }
    ],
  ): {
    sharesInfo: Array<{ shareId: number; shareStage: string }>;
    qaStatus: string;
    overallStatus: string;
  } => {
    let overallStatus: string = HEXA_HEALTH.STAGE1;
    const qaRes = this.qaHealthStatus( qaTimestamp );
    const qaStatus = qaRes.qaStage;
    let sharesData: any;
    let sharesInfo: any;
    sharesData = this.shareHealthStatus( shares );
    sharesInfo = sharesData.sharesInfo;
    if ( this.counter.ugly > 3 || this.counter.bad > 4 ) {
      overallStatus = HEXA_HEALTH.STAGE1;
    } else if ( this.counter.ugly > 2 || this.counter.bad > 3 ) {
      overallStatus = HEXA_HEALTH.STAGE2;
    } else if ( this.counter.ugly > 1 || this.counter.bad > 2 ) {
      overallStatus = HEXA_HEALTH.STAGE3;
    } else if ( this.counter.ugly > 0 || this.counter.bad > 1 ) {
      overallStatus = HEXA_HEALTH.STAGE4;
    } else if ( this.counter.good >= 6 ) {
      overallStatus = HEXA_HEALTH.STAGE5;
    }
    return { sharesInfo, qaStatus, overallStatus };
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

  private shareHealthStatus = (
    shares: [
      { shareId: string; updatedAt: number },
      { shareId: string; updatedAt: number },
      { shareId: string; updatedAt: number },
      { shareId: string; updatedAt: number },
      { shareId: string; updatedAt: number }
    ],
  ): {
    sharesInfo: Array<{ shareId: number; shareStage: string }>;
  } => {
    const sharesInfo = [];
    for ( let itr = 0; itr < shares.length; itr++ ) {
      const obj = shares[ itr ];
      sharesInfo.push( {
        shareId: obj.shareId,
        shareStage: ENTITY_HEALTH.STAGE1,
      } );
    }
    const delta: number[] = new Array( 5 );
    const numberOfDays: number[] = new Array( 5 );
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
        this.counter.ugly++;
      } else if (
        numberOfDays[ i ] > TIME_SLOTS.SHARE_SLOT1 &&
        numberOfDays[ i ] <= TIME_SLOTS.SHARE_SLOT2
      ) {
        obj.shareStage = ENTITY_HEALTH.STAGE2;
        this.counter.bad++;
      } else if ( numberOfDays[ i ] <= TIME_SLOTS.SHARE_SLOT1 ) {
        //  console.log("executing");
        obj.shareStage = ENTITY_HEALTH.STAGE3;
        this.counter.good++;
      }
    }
    // console.log(sharesInfo);
    // console.log(numberOfDays);
    return { sharesInfo };
  }
}

/////////// SMOKE TEST ///////////////

// const healthStatus = new HealthStatus();
// console.log(
//   "Share based:",
//   healthStatus.appHealthStatus(1561962821000, [
//     {
//       shareId:
//         "36a18aa414577e81519e35f29005594af4b98e9dac624fe2ad2672b95dd4d060",
//       updatedAt: 1561962821000,
//     },
//     {
//       shareId:
//         "9440ad3a0dbbd0fe8c031f115bcedc3028a04f47ca8695c9abbe112265bb0f48",
//       updatedAt: 1561962821000,
//     },
//     {
//       shareId:
//         "725b509e463befed2214a8bc32c78ec2300b153ab7168f6c3e64e4739b9aed61",
//       updatedAt: 1560729600000,
//     },
//     {
//       shareId:
//         "725b509e463befed2214a8bc32c78ec2300b153ab7168f6c3e64e4739b9aed61",
//       updatedAt: 1560729600000,
//     },
//     {
//       shareId:
//         "725b509e463befed2214a8bc32c78ec2300b153ab7168f6c3e64e4739b9aed61",
//       updatedAt: 1560729600000,
//     },
//   ]),
// );
// 1559027987497
// 1561962821000
// 1560729600000
// console.log(
//   "Mnemonic based:",
//   healthStatus.appHealthStatus(
//     1555725600000,
//     1555725600000,
//     null,
//     1555725600000,
//   ),
// );