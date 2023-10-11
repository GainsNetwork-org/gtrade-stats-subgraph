import { BigDecimal, log } from "@graphprotocol/graph-ts";
import { AggregateTradingStat,UserPointStat } from "../../types/schema";
import {ZERO_BD,EPOCH_TYPE,determineEpochNumber,PROTOCOL} from "../constants";
import {TOTAL_WEEKLY_REWARDS, TOTAL_WEEKLY_POINTS, LOYALTY_WEIGHT,
         VOLUME_WEIGHT, SKILL_WEIGHT, HUNDRED} from "../points_weights"

export function updateStakingPoints(
  address: string,
  weekNumber: i32,
  dayNumber:i32,
  Pnl:BigDecimal,
  PnlPercentage:BigDecimal,
):void{


  const userWeeklyPoints = createOrLoadUserPointStat(
    address,
    EPOCH_TYPE.WEEK,
    weekNumber,
    false
  );

  const protocolWeeklyPoints = createOrLoadUserPointStat(
    "PROTOCOL",
    EPOCH_TYPE.WEEK,
    weekNumber,
    false
  );

  let userOldWeeklyPnl = userWeeklyPoints.pnl
  let userNewWeeklyPnl = (userWeeklyPoints.pnl).plus(Pnl)
  let protocolOldWeeklyPnl = protocolWeeklyPoints.pnl
  let protocolNewWeeklyPnl = ZERO_BD
  let userSkillPoints = ZERO_BD
  let protocolSkillPoints = calculateSkillPoints(protocolNewWeeklyPnl,protocolNewWeeklyPnl)

  if(userNewWeeklyPnl>ZERO_BD && userOldWeeklyPnl>ZERO_BD){
    protocolNewWeeklyPnl = protocolOldWeeklyPnl.minus(userOldWeeklyPnl).plus(userNewWeeklyPnl)
    userSkillPoints = calculateSkillPoints(userNewWeeklyPnl,protocolNewWeeklyPnl)
  }
  else if(userNewWeeklyPnl>ZERO_BD && userOldWeeklyPnl<ZERO_BD){
    protocolNewWeeklyPnl = protocolOldWeeklyPnl.plus(userNewWeeklyPnl)
    userSkillPoints = calculateSkillPoints(userNewWeeklyPnl,protocolNewWeeklyPnl)
  }
  else if(userNewWeeklyPnl<ZERO_BD && userOldWeeklyPnl>ZERO_BD){
    protocolNewWeeklyPnl = protocolOldWeeklyPnl.minus(userOldWeeklyPnl)
    userSkillPoints = ZERO_BD
  }
  else{
    protocolNewWeeklyPnl = protocolOldWeeklyPnl
  }

  userWeeklyPoints.pnl = userNewWeeklyPnl
  protocolWeeklyPoints.pnl = protocolNewWeeklyPnl

  userWeeklyPoints.skillPoints = userSkillPoints
  protocolWeeklyPoints.skillPoints =protocolSkillPoints

  userWeeklyPoints.totalPoints = userWeeklyPoints.loyaltyPoints.plus(userWeeklyPoints.volumePoints).plus(userSkillPoints)
  protocolWeeklyPoints.totalPoints = protocolWeeklyPoints.loyaltyPoints.plus(protocolWeeklyPoints.volumePoints).plus(protocolSkillPoints)  

  // Saving all the entities
  userWeeklyPoints.save()
  protocolWeeklyPoints.save()  

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

function updateVolumePoints(
  stat: BigDecimal,
  userDailyStats: UserPointStat,
  userWeeklyStats:UserPointStat,
  protocolDailyStats: UserPointStat,
  protocolWeeklyStats:UserPointStat
): void {

  let totalUserWeeklyFees = userWeeklyStats.totalFeesPaid.plus(stat)
  let totalProtocolWeeklyFees = protocolWeeklyStats.totalFeesPaid.plus(stat)

  // calculate volume points and rewards for the given week
  let userWeeklyVolumePoints = BigDecimal.fromString("0")
  let protocolWeeklyVolumePoints = BigDecimal.fromString("0")

  if(totalProtocolWeeklyFees >ZERO_BD && totalUserWeeklyFees >ZERO_BD ){
    userWeeklyVolumePoints = calculateVolumePoints(totalUserWeeklyFees,totalProtocolWeeklyFees)
    protocolWeeklyVolumePoints = calculateVolumePoints(totalProtocolWeeklyFees,totalProtocolWeeklyFees)
  }  

  // Updating total fees paid and volume points
  userWeeklyStats.totalFeesPaid = totalUserWeeklyFees
  protocolWeeklyStats.totalFeesPaid = totalProtocolWeeklyFees

  userWeeklyStats.volumePoints = userWeeklyVolumePoints
  protocolWeeklyStats.volumePoints = protocolWeeklyVolumePoints  

  // Updating total reward points
  userWeeklyStats.totalPoints = userWeeklyStats.loyaltyPoints.plus(userWeeklyStats.skillPoints).plus(userWeeklyVolumePoints) 
  protocolWeeklyStats.totalPoints = protocolWeeklyStats.loyaltyPoints.plus(protocolWeeklyStats.skillPoints).plus(protocolWeeklyVolumePoints)  

  // Saving all the entities
  userWeeklyStats.save()
  protocolWeeklyStats.save()
}

function updateLoyaltyPoints(
  stat: BigDecimal,
  userDailyStats: UserPointStat,
  userWeeklyStats:UserPointStat,
  protocolDailyStats: UserPointStat,
  protocolWeeklyStats:UserPointStat
): void {

  let totalUserDailyFees = userDailyStats.totalFeesPaid.plus(stat)
  let userXPoints = calculateLoyaltyPoints(totalUserDailyFees)

  let loyaltyPointsBefore = userDailyStats.xPoints


  let userWeeklyXPoints = userWeeklyStats.xPoints.plus(userXPoints).minus(loyaltyPointsBefore)
  let protocolWeeklyXPoints = protocolWeeklyStats.xPoints.plus(userXPoints).minus(loyaltyPointsBefore)  

  let userWeeklyLoyaltyPoints = BigDecimal.fromString("0")
  let protocolWeeklyLoyaltyPoints = BigDecimal.fromString("0")

  if(protocolWeeklyXPoints >ZERO_BD ){
    userWeeklyLoyaltyPoints = calculateLoyaltyRewards(userWeeklyXPoints,protocolWeeklyXPoints)
    protocolWeeklyLoyaltyPoints = calculateLoyaltyRewards(protocolWeeklyXPoints,protocolWeeklyXPoints)
  }

  // Updating loyalty points and loyalty reward points  
  userDailyStats.xPoints = userXPoints  
  userWeeklyStats.xPoints = userWeeklyXPoints
  protocolWeeklyStats.xPoints = protocolWeeklyXPoints

  userWeeklyStats.loyaltyPoints = userWeeklyLoyaltyPoints
  protocolWeeklyStats.loyaltyPoints = protocolWeeklyLoyaltyPoints  

  // Updating total reward points
  userWeeklyStats.totalPoints = userWeeklyStats.skillPoints.plus(userDailyStats.volumePoints).plus(userWeeklyLoyaltyPoints)
  protocolWeeklyStats.totalPoints = protocolWeeklyStats.skillPoints.plus(protocolWeeklyStats.volumePoints).plus(protocolWeeklyLoyaltyPoints)  

  // Saving all the entities
  userDailyStats.save()
  userWeeklyStats.save()
  protocolWeeklyStats.save()
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
    userPointStat.xPoints = BigDecimal.fromString("0")
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

export function calculateLoyaltyRewards(
  userPoints: BigDecimal,
  protocolPoints:BigDecimal
):BigDecimal{
  let numPoints = userPoints.times(LOYALTY_WEIGHT).times(TOTAL_WEEKLY_POINTS)
  let divisorPoints = protocolPoints.times(HUNDRED)
  let pts = numPoints.div(divisorPoints)
  return pts
}  

export function calculateVolumePoints(
  userWeeklyFees: BigDecimal,
  protocolWeeklyFees:BigDecimal
):BigDecimal{
  let numPoints = userWeeklyFees.times(VOLUME_WEIGHT).times(TOTAL_WEEKLY_POINTS)
  let divisorPoints = protocolWeeklyFees.times(HUNDRED)
  let pts = numPoints.div(divisorPoints)
  return pts
}


export function calculateSkillPoints(
  userPnl: BigDecimal,
  protocolPnl:BigDecimal
):BigDecimal{
  let numPoints = userPnl.times(SKILL_WEIGHT).times(TOTAL_WEEKLY_POINTS)
  let divisorPoints = protocolPnl.times(HUNDRED)
  let pts = numPoints.div(divisorPoints) 
  return pts
}
