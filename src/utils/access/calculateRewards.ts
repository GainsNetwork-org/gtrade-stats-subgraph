import { BigDecimal, log } from "@graphprotocol/graph-ts";
import { UserPointStat } from "../../types/schema";
import {ZERO_BD,EPOCH_TYPE,determineEpochNumber,PROTOCOL} from "../constants";

export function updateStakingPoints(
  address: string,
  weekNumber: i32,
  dayNumber:i32,
  Pnl:BigDecimal,
  PnlPercentage:BigDecimal,
):void{
  // load all 4 entries: UserDaily, ProtocolDaily, UserWeekly, ProtocolWeekly
  const userDailyPoints = createOrLoadUserPointStat(address,EPOCH_TYPE.DAY,dayNumber,false);
  const protocolDailyPoints = createOrLoadUserPointStat("PROTOCOL",EPOCH_TYPE.DAY,weekNumber,false);  
  const userWeeklyPoints = createOrLoadUserPointStat(address,EPOCH_TYPE.WEEK,weekNumber,false);
  const protocolWeeklyPoints = createOrLoadUserPointStat("PROTOCOL",EPOCH_TYPE.WEEK,weekNumber,false);

  let UserDailySkillPoints = userDailyPoints.pnl.plus(Pnl) > ZERO_BD ?userDailyPoints.pnl.plus(Pnl) :ZERO_BD
  let UserWeeklySkillPoints = userWeeklyPoints.pnl.plus(Pnl) > ZERO_BD ?userWeeklyPoints.pnl.plus(Pnl) :ZERO_BD  
  let protocolDailySkillPoints = calculateSkillPoints(userDailyPoints,protocolDailyPoints,Pnl)
  let protocolDailyWeeklyPoints = calculateSkillPoints(userWeeklyPoints,protocolWeeklyPoints,Pnl)

  // update pnls
  userDailyPoints.pnl = userDailyPoints.pnl.plus(Pnl)
  protocolDailyPoints.pnl = protocolDailyPoints.pnl.plus(Pnl)
  userWeeklyPoints.pnl = userWeeklyPoints.pnl.plus(Pnl)
  protocolWeeklyPoints.pnl = protocolWeeklyPoints.pnl.plus(Pnl)

  // update skill points
  userDailyPoints.skillPoints = UserDailySkillPoints
  protocolDailyPoints.skillPoints = protocolDailySkillPoints
  userWeeklyPoints.skillPoints = UserWeeklySkillPoints
  protocolWeeklyPoints.skillPoints = protocolDailyWeeklyPoints

  // update total points 
  userWeeklyPoints.totalPoints = userWeeklyPoints.loyaltyPoints.plus(userWeeklyPoints.volumePoints).plus(UserDailySkillPoints)
  protocolWeeklyPoints.totalPoints = protocolWeeklyPoints.loyaltyPoints.plus(protocolWeeklyPoints.volumePoints).plus(protocolDailySkillPoints)  
  userWeeklyPoints.totalPoints = userWeeklyPoints.loyaltyPoints.plus(userWeeklyPoints.volumePoints).plus(UserWeeklySkillPoints)
  protocolWeeklyPoints.totalPoints = protocolWeeklyPoints.loyaltyPoints.plus(protocolWeeklyPoints.volumePoints).plus(protocolDailyWeeklyPoints)  

  // Saving all the entities
  userDailyPoints.save()
  protocolDailyPoints.save()
  userWeeklyPoints.save()
  protocolWeeklyPoints.save()  

}

export function calculateSkillPoints(
  userStat: UserPointStat,
  protocolStat: UserPointStat,
  PnL: BigDecimal
): BigDecimal {

  let userOldPnl = userStat.pnl
  let protocolOldPnl = protocolStat.pnl
  let userNewPnl = userOldPnl.plus(PnL)
  let protocolNewPnl = ZERO_BD

  if(userNewPnl>ZERO_BD && userOldPnl>ZERO_BD){
    protocolNewPnl = protocolOldPnl.minus(userOldPnl).plus(userNewPnl)
  }
  else if(userNewPnl>ZERO_BD && userOldPnl<ZERO_BD){
    protocolNewPnl = protocolOldPnl.plus(userNewPnl)
  }
  else if(userNewPnl<ZERO_BD && userOldPnl>ZERO_BD){
    protocolNewPnl = protocolOldPnl.minus(userOldPnl)
  }
  else{
    protocolNewPnl = ZERO_BD
  }

  return protocolNewPnl
}

export function updateRewards(
  address: string,
  stat: BigDecimal,
  timestamp: i32
): void {
  const currentDayNumber = determineEpochNumber(timestamp, EPOCH_TYPE.DAY);
  const currentWeekNumber = determineEpochNumber(timestamp, EPOCH_TYPE.WEEK);

  let userDailyStats = createOrLoadUserPointStat(
    address,
    EPOCH_TYPE.DAY,
    currentDayNumber,
    false
  );

  let userWeeklyStats = createOrLoadUserPointStat(
    address,
    EPOCH_TYPE.WEEK,
    currentWeekNumber,
    false
  );  

  let dailyProtocolStats = createOrLoadUserPointStat(
    PROTOCOL,
    EPOCH_TYPE.DAY,
    currentDayNumber,
    false
  );

  let weeklyProtocolStats = createOrLoadUserPointStat(
    PROTOCOL,
    EPOCH_TYPE.WEEK,
    currentWeekNumber,
    false
  );

  updateVolumePoints(stat, userDailyStats,userWeeklyStats,dailyProtocolStats,weeklyProtocolStats);
  updateLoyaltyPoints(stat, userDailyStats,userWeeklyStats,dailyProtocolStats,weeklyProtocolStats);

}

export function updateVolumePoints(
  stat: BigDecimal,
  userDailyStats: UserPointStat,
  userWeeklyStats:UserPointStat,
  protocolDailyStats: UserPointStat,
  protocolWeeklyStats:UserPointStat
): void {

  // Updating total fees  
  userDailyStats.totalFeesPaid = userDailyStats.totalFeesPaid.plus(stat)
  userWeeklyStats.totalFeesPaid = userWeeklyStats.totalFeesPaid.plus(stat)
  protocolDailyStats.totalFeesPaid = protocolDailyStats.totalFeesPaid.plus(stat)
  protocolWeeklyStats.totalFeesPaid = protocolWeeklyStats.totalFeesPaid.plus(stat)


  // Updating loyalty points  
  userDailyStats.volumePoints = userDailyStats.volumePoints.plus(stat)
  userWeeklyStats.volumePoints = userWeeklyStats.volumePoints.plus(stat)
  protocolDailyStats.volumePoints = protocolDailyStats.volumePoints.plus(stat)
  protocolWeeklyStats.volumePoints = protocolWeeklyStats.volumePoints.plus(stat)

  // Updating total reward points
  userDailyStats.totalPoints = userDailyStats.totalPoints.plus(stat)
  userWeeklyStats.totalPoints = userWeeklyStats.totalPoints.plus(stat)
  protocolDailyStats.totalPoints = protocolDailyStats.totalPoints.plus(stat)
  protocolWeeklyStats.totalPoints = protocolWeeklyStats.totalPoints.plus(stat)

  // Saving all the entities
  userDailyStats.save()
  protocolDailyStats.save()
  userWeeklyStats.save()
  protocolWeeklyStats.save()
}

export function updateLoyaltyPoints(
  stat: BigDecimal,
  userDailyStats: UserPointStat,
  userWeeklyStats:UserPointStat,
  protocolDailyStats: UserPointStat,
  protocolWeeklyStats:UserPointStat
): void {

  let totalUserDailyFees = userDailyStats.totalFeesPaid.plus(stat)
  let oldLoyaltyPoints = userDailyStats.loyaltyPoints
  let newLoyaltyPoints = calculateLoyaltyPoints(totalUserDailyFees)

  let userDailyLoyaltyPoints = newLoyaltyPoints
  let userWeeklyLoyaltyPoints = userWeeklyStats.loyaltyPoints.plus(newLoyaltyPoints).minus(oldLoyaltyPoints)
  let protocolDailyLoyaltyPoints = protocolDailyStats.loyaltyPoints.plus(newLoyaltyPoints).minus(oldLoyaltyPoints)
  let protocolWeeklyLoyaltyPoints = protocolWeeklyStats.loyaltyPoints.plus(newLoyaltyPoints).minus(oldLoyaltyPoints)  

  // Updating loyalty points  
  userDailyStats.loyaltyPoints = userDailyLoyaltyPoints  
  userWeeklyStats.loyaltyPoints = userWeeklyLoyaltyPoints
  protocolDailyStats.loyaltyPoints = protocolDailyLoyaltyPoints
  protocolWeeklyStats.loyaltyPoints = protocolWeeklyLoyaltyPoints

  // Updating total reward points
  userDailyStats.totalPoints = userDailyStats.skillPoints.plus(userDailyStats.volumePoints).plus(userDailyLoyaltyPoints)
  userWeeklyStats.totalPoints = userWeeklyStats.skillPoints.plus(userWeeklyStats.volumePoints).plus(userWeeklyLoyaltyPoints)
  protocolDailyStats.totalPoints = protocolDailyStats.skillPoints.plus(protocolDailyStats.volumePoints).plus(protocolDailyLoyaltyPoints)  
  protocolWeeklyStats.totalPoints = protocolWeeklyStats.skillPoints.plus(protocolWeeklyStats.volumePoints).plus(protocolWeeklyLoyaltyPoints)  

  // Saving all the entities
  userDailyStats.save()
  protocolDailyStats.save()
  userWeeklyStats.save()
  protocolWeeklyStats.save()
}


export function calculateLoyaltyPoints(
  fees: BigDecimal
):BigDecimal{
  if(fees >= BigDecimal.fromString("8") && fees <BigDecimal.fromString("40")) {
    return BigDecimal.fromString("1")
  }
  else if(fees >= BigDecimal.fromString("40") && fees <BigDecimal.fromString("200")) {
    return BigDecimal.fromString("5")
  }    
  else if(fees >= BigDecimal.fromString("200") && fees <BigDecimal.fromString("400")) {
    return BigDecimal.fromString("25")
  }
  else if(fees >= BigDecimal.fromString("400")) {
    return BigDecimal.fromString("50")
  }
  else{
    return BigDecimal.fromString("0")
  }  
}

export function generateId(
  address: string,
  epochType: string,
  epochNumber: i32
): string {
  return address + "-" + epochType + "-" + epochNumber.toString();
}

export function createOrLoadUserPointStat(
  address: string,
  epochType: string,
  epochNumber: i32,
  save: boolean
): UserPointStat {
  log.info(
    "[createOrLoadUserPointStat] address {}, epochType {}, epochNumber {}",
    [address, epochType.toString(), epochNumber.toString()]
  );
  const id = generateId(address, epochType, epochNumber);
  let userPointStat = UserPointStat.load(id);
  if (userPointStat == null) {
    userPointStat = new UserPointStat(id);
    userPointStat.address = address
    userPointStat.epochNumber = epochNumber
    userPointStat.epochType = epochType
    userPointStat.totalFeesPaid = BigDecimal.fromString("0")
    userPointStat.pnl = BigDecimal.fromString("0")
    userPointStat.pnlPercentage = BigDecimal.fromString("0")
    userPointStat.loyaltyPoints = BigDecimal.fromString("0")
    userPointStat.skillPoints = BigDecimal.fromString("0")
    userPointStat.volumePoints = BigDecimal.fromString("0")
    userPointStat.totalPoints = BigDecimal.fromString("0")
    if (save) {
      userPointStat.save();
    }
  }
  return userPointStat as UserPointStat;
}

