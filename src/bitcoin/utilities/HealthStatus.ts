import config from "../Config";
export default class HealthStatus {
  public uglyCount = 0;
  public goodCount = 0;
  public badCount = 0;
  public T: number = parseInt( config.HEALTH_CHECK_TIME, 10 );

  public appHealthStatus = (
    QAtime: number,
    SAtime: number,
    share: [
      { shareId: string; updatedAt: number },
      { shareId: string; updatedAt: number },
      { shareId: string; updatedAt: number }
    ],
  ) => {
    let appStatus = "1";
    const ss = this.shareHealthStatus( share );
    const sharesStatus = ss.SharesStage;
    const QAStatus = this.QAHealthStatus( QAtime );
    const SAStatus = this.secureAccountHealthStatus( SAtime );
    if ( this.uglyCount >= 2 ) {
      appStatus = "1";
    } else if ( this.uglyCount === 1 ) {
      appStatus = "2";
    } else if ( this.badCount > 1 ) {
      appStatus = "3";
    } else if ( this.badCount === 1 ) {
      appStatus = "4";
    } else if ( this.goodCount === 3 ) {
      appStatus = "5";
    }
    return {
      shareInfo: ss.shareInfo,
      sharesStatus,
      QAStatus,
      SAStatus,
      appStatus,
    };
  }


  private QAHealthStatus = ( time: number ) => {
    let QAStage = "ugly";
    const delta = Math.abs( Date.now() - time );
    const numberOfDays = Math.round( delta / ( 60 * 60 * 24 * 1000 ) );

    if ( numberOfDays > 2 * this.T ) {
      QAStage = "ugly";
      this.uglyCount++;
    } else if ( numberOfDays > this.T && numberOfDays <= 2 * this.T ) {
      QAStage = "bad";
      this.badCount++;
    } else if ( numberOfDays <= this.T ) {
      QAStage = "good";
      this.goodCount++;
    }
    return QAStage;
  }

  private secureAccountHealthStatus = ( time: number ) => {
    let SAStage = "ugly";
    const delta = Math.abs( Date.now() - time );
    const numberOfDays = Math.floor( delta / ( 60 * 60 * 24 * 1000 ) );
    if ( numberOfDays > 2 * this.T ) {
      SAStage = "ugly";
      this.uglyCount++;
    } else if ( numberOfDays > this.T && numberOfDays <= 2 * this.T ) {
      SAStage = "bad";
      this.badCount++;
    } else if ( numberOfDays <= this.T ) {
      SAStage = "good";
      this.goodCount++;
    }
    return SAStage;
  }

  private shareHealthStatus = (
    share: [
      { shareId: string; updatedAt: number },
      { shareId: string; updatedAt: number },
      { shareId: string; updatedAt: number }
    ],
  ) => {
    let SharesStage = "ugly";
    const sStage: string[] = new Array( 3 );
    const shareInfo = [];
    let shareUglyCount = 0;
    let shareBadCount = 0;
    let shareGoodCount = 0;
    for ( let i = 0; i < 3; i++ ) {
      const obj = share[ i ];
      shareInfo.push( { shareid: obj.shareId, shareStage: "ugly" } );
    }
    const delta: number[] = new Array( 3 );
    const numberOfDays: number[] = new Array( 3 );
    for ( let i = 0; i < delta.length; i++ ) {
      const obj = share[ i ];
      delta[ i ] = Math.abs( Date.now() - obj.updatedAt );
    }
    for ( let i = 0; i < numberOfDays.length; i++ ) {
      numberOfDays[ i ] = Math.floor( delta[ i ] / ( 60 * 60 * 24 * 1000 ) );
      const obj = shareInfo[ i ];
      if ( numberOfDays[ i ] > 2 * this.T ) {
        obj.shareStage = "ugly";
        shareUglyCount++;
      } else if ( numberOfDays[ i ] > this.T && numberOfDays[ i ] <= 2 * this.T ) {
        obj.shareStage = "bad";
        shareBadCount++;
      } else if ( numberOfDays[ i ] <= this.T ) {
        obj.shareStage = "good";
        shareGoodCount++;
      }
    }
    if ( shareUglyCount >= 2 ) {
      SharesStage = "ugly";
      this.uglyCount++;
    } else if ( shareGoodCount > 2 ) {
      SharesStage = "good";
      this.goodCount++;
    } else if (
      shareGoodCount === 2 &&
      ( shareBadCount === 1 || shareUglyCount === 1 )
    ) {
      SharesStage = "bad";
      this.badCount++;
    } else if (
      shareBadCount === 2 &&
      ( shareGoodCount === 1 || shareUglyCount === 1 )
    ) {
      SharesStage = "ugly";
      this.uglyCount++;
    } else if ( shareBadCount >= 2 ) {
      SharesStage = "ugly";
      this.uglyCount++;
    }
    return { SharesStage, shareInfo };
  }
}
// export default new HealthStatus();
// const hs = new HealthStatus();
// hs.appHealthStatus(1555725600000, 1555725600000, [
//   {
//     shareid: "856e8ade9c4ec1edca1ec84f8674af25d52e4270842c365eb48e73ed35702f86",
//     shareTimestamp: 1556416800000,
//   },
//   {
//     shareid: "856e8ade9c4ec1edca1ec84f8674af25d52e4270842c365eb48e73ed35702f86",
//     shareTimestamp: 1556416800000,
//   },
//   {
//     shareid: "856e8ade9c4ec1edca1ec84f8674af25d52e4270842c365eb48e73ed35702f86",
//     shareTimestamp: 1555725600000,
//   },
// ]);

// 1556416800000 good
// 1554084000000 ugly
// 1555725600000 bad
