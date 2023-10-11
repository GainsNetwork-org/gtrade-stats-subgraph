import { BigDecimal, log } from "@graphprotocol/graph-ts";
import { UserPointStat } from "../../types/schema";
import {ZERO_BD,EPOCH_TYPE,determineEpochNumber,PROTOCOL,MIN_VOLUME,ONE_BD} from "../constants";

export function updateRewardEntities(
  address: string,
  weekNumber: i32,
  dayNumber:i32,
  Pnl:BigDecimal,
  PnlPercentage:BigDecimal,
  groupNumber:i32,
  volume:BigDecimal
):void{
  // load all 4 entries: UserDaily, ProtocolDaily, UserWeekly, ProtocolWeekly
  const userDailyPoints = createOrLoadUserPointStat(address,EPOCH_TYPE.DAY,dayNumber,false);
  const protocolDailyPoints = createOrLoadUserPointStat("PROTOCOL",EPOCH_TYPE.DAY,weekNumber,false);  
  const userWeeklyPoints = createOrLoadUserPointStat(address,EPOCH_TYPE.WEEK,weekNumber,false);
  const protocolWeeklyPoints = createOrLoadUserPointStat("PROTOCOL",EPOCH_TYPE.WEEK,weekNumber,false);

  updateAbsoluteSkillPoints(userDailyPoints,protocolDailyPoints,userWeeklyPoints,protocolWeeklyPoints,Pnl)
  updateRelativeSkillPoints(userDailyPoints,protocolDailyPoints,userWeeklyPoints,protocolWeeklyPoints,PnlPercentage)
  updateDiversityPoints(userDailyPoints,protocolDailyPoints,userWeeklyPoints,protocolWeeklyPoints,groupNumber,volume)

}

export function updateAbsoluteSkillPoints(
  userDailyPoints: UserPointStat,
  protocolDailyPoints: UserPointStat,
  userWeeklyPoints:UserPointStat,
  protocolWeeklyPoints:UserPointStat,
  Pnl:BigDecimal
):void{

  let UserDailySkillPoints = userDailyPoints.pnl.plus(Pnl) > ZERO_BD ?userDailyPoints.pnl.plus(Pnl) :ZERO_BD
  let UserWeeklySkillPoints = userWeeklyPoints.pnl.plus(Pnl) > ZERO_BD ?userWeeklyPoints.pnl.plus(Pnl) :ZERO_BD  
  let protocolDailySkillPoints = calculateSkillPoints(userDailyPoints,protocolDailyPoints,Pnl)
  let protocolWeeklySkillPoints = calculateSkillPoints(userWeeklyPoints,protocolWeeklyPoints,Pnl)

  // update pnls
  userDailyPoints.pnl = userDailyPoints.pnl.plus(Pnl)
  protocolDailyPoints.pnl = protocolDailyPoints.pnl.plus(Pnl)
  userWeeklyPoints.pnl = userWeeklyPoints.pnl.plus(Pnl)
  protocolWeeklyPoints.pnl = protocolWeeklyPoints.pnl.plus(Pnl)

  // update total points 
  userDailyPoints.totalPoints = userDailyPoints.totalPoints.minus(userDailyPoints.absSkillPoints).plus(UserDailySkillPoints)
  protocolDailyPoints.totalPoints = protocolDailyPoints.totalPoints.minus(protocolDailyPoints.absSkillPoints).plus(protocolDailySkillPoints)
  userWeeklyPoints.totalPoints = userWeeklyPoints.totalPoints.minus(userWeeklyPoints.absSkillPoints).plus(UserWeeklySkillPoints)
  protocolWeeklyPoints.totalPoints = protocolWeeklyPoints.totalPoints.minus(protocolWeeklyPoints.absSkillPoints).plus(protocolWeeklySkillPoints)

  // update skill points
  userDailyPoints.absSkillPoints = UserDailySkillPoints
  protocolDailyPoints.absSkillPoints = protocolDailySkillPoints
  userWeeklyPoints.absSkillPoints = UserWeeklySkillPoints
  protocolWeeklyPoints.absSkillPoints = protocolWeeklySkillPoints

  // Saving all the entities
  userDailyPoints.save()
  protocolDailyPoints.save()
  userWeeklyPoints.save()
  protocolWeeklyPoints.save()  
}

export function updateRelativeSkillPoints(
  userDailyPoints: UserPointStat,
  protocolDailyPoints: UserPointStat,
  userWeeklyPoints:UserPointStat,
  protocolWeeklyPoints:UserPointStat,
  PnlPercentage:BigDecimal,
):void{

  let UserDailySkillPoints = userDailyPoints.pnlPercentage.plus(PnlPercentage) > ZERO_BD ?userDailyPoints.pnlPercentage.plus(PnlPercentage) :ZERO_BD
  let UserWeeklySkillPoints = userWeeklyPoints.pnlPercentage.plus(PnlPercentage) > ZERO_BD ?userWeeklyPoints.pnlPercentage.plus(PnlPercentage) :ZERO_BD  
  let protocolDailySkillPoints = calculateSkillPoints(userDailyPoints,protocolDailyPoints,PnlPercentage)
  let protocolWeeklySkillPoints = calculateSkillPoints(userWeeklyPoints,protocolWeeklyPoints,PnlPercentage)
  
  // update pnls
  userDailyPoints.pnlPercentage = userDailyPoints.pnlPercentage.plus(PnlPercentage)
  protocolDailyPoints.pnlPercentage = protocolDailyPoints.pnlPercentage.plus(PnlPercentage)
  userWeeklyPoints.pnlPercentage = userWeeklyPoints.pnlPercentage.plus(PnlPercentage)
  protocolWeeklyPoints.pnlPercentage = protocolWeeklyPoints.pnlPercentage.plus(PnlPercentage)

  // update total points 
  userDailyPoints.totalPoints = userDailyPoints.totalPoints.minus(userDailyPoints.relSkillPoints).plus(UserDailySkillPoints)
  protocolDailyPoints.totalPoints = protocolDailyPoints.totalPoints.minus(protocolDailyPoints.relSkillPoints).plus(protocolDailySkillPoints)
  userWeeklyPoints.totalPoints = userWeeklyPoints.totalPoints.minus(userWeeklyPoints.relSkillPoints).plus(UserWeeklySkillPoints)
  protocolWeeklyPoints.totalPoints = protocolWeeklyPoints.totalPoints.minus(protocolWeeklyPoints.relSkillPoints).plus(protocolWeeklySkillPoints)

  // update skill points
  userDailyPoints.relSkillPoints = UserDailySkillPoints
  protocolDailyPoints.relSkillPoints = protocolDailySkillPoints
  userWeeklyPoints.relSkillPoints = UserWeeklySkillPoints
  protocolWeeklyPoints.relSkillPoints = protocolWeeklySkillPoints

  // Saving all the entities
  userDailyPoints.save()
  protocolDailyPoints.save()
  userWeeklyPoints.save()
  protocolWeeklyPoints.save()  
}

export function updateDiversityPoints(
  userDailyPoints: UserPointStat,
  protocolDailyPoints: UserPointStat,
  userWeeklyPoints:UserPointStat,
  protocolWeeklyPoints:UserPointStat,
  groupNumber:i32,
  volume:BigDecimal
):void{

  if(volume > MIN_VOLUME && userWeeklyPoints.groupsTraded[groupNumber]==ZERO_BD) {

    let totalPoints = ONE_BD
    for (let i = 0; i > userWeeklyPoints.groupsTraded.length; i++) {
      totalPoints=totalPoints.plus(userWeeklyPoints.groupsTraded[i])
    }

    userDailyPoints.groupsTraded[groupNumber] = ONE_BD
    protocolDailyPoints.groupsTraded[groupNumber] = ONE_BD
    userWeeklyPoints.groupsTraded[groupNumber] = ONE_BD
    protocolWeeklyPoints.groupsTraded[groupNumber] = ONE_BD


    userDailyPoints.diversityPoints = totalPoints
    protocolDailyPoints.diversityPoints = totalPoints
    userWeeklyPoints.diversityPoints = totalPoints
    protocolWeeklyPoints.diversityPoints = totalPoints

    userDailyPoints.totalPoints = userDailyPoints.totalPoints.plus(ONE_BD)
    protocolDailyPoints.totalPoints = protocolDailyPoints.totalPoints.plus(ONE_BD)
    userWeeklyPoints.totalPoints = userWeeklyPoints.totalPoints.plus(ONE_BD)
    protocolWeeklyPoints.totalPoints = protocolWeeklyPoints.totalPoints.plus(ONE_BD)    

  }

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
  userDailyStats.totalPoints = userDailyStats.relSkillPoints.plus(userDailyStats.volumePoints).plus(userDailyLoyaltyPoints)
  userWeeklyStats.totalPoints = userWeeklyStats.relSkillPoints.plus(userWeeklyStats.volumePoints).plus(userWeeklyLoyaltyPoints)
  protocolDailyStats.totalPoints = protocolDailyStats.relSkillPoints.plus(protocolDailyStats.volumePoints).plus(protocolDailyLoyaltyPoints)  
  protocolWeeklyStats.totalPoints = protocolWeeklyStats.relSkillPoints.plus(protocolWeeklyStats.volumePoints).plus(protocolWeeklyLoyaltyPoints)  

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
    userPointStat.groupsTraded = [ZERO_BD,ZERO_BD,ZERO_BD,ZERO_BD]
    userPointStat.loyaltyPoints = BigDecimal.fromString("0")
    userPointStat.diversityPoints = BigDecimal.fromString("0")
    userPointStat.absSkillPoints = BigDecimal.fromString("0")
    userPointStat.relSkillPoints = BigDecimal.fromString("0")
    userPointStat.volumePoints = BigDecimal.fromString("0")
    userPointStat.totalPoints = BigDecimal.fromString("0")
    if (save) {
      userPointStat.save();
    }
  }
  return userPointStat as UserPointStat;
}

