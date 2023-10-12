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
  const protocolDailyPoints = createOrLoadUserPointStat("PROTOCOL",EPOCH_TYPE.DAY,dayNumber,false);  
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

  if(groupNumber <4) {
  if(volume > MIN_VOLUME && userWeeklyPoints.groupsTraded[groupNumber]==ZERO_BD) {

    userDailyPoints.groupsTraded[groupNumber] = ONE_BD
    protocolDailyPoints.groupsTraded[groupNumber] = ONE_BD
    userWeeklyPoints.groupsTraded[groupNumber] = ONE_BD
    protocolWeeklyPoints.groupsTraded[groupNumber] = ONE_BD

    userDailyPoints.diversityPoints = userDailyPoints.diversityPoints.plus(ONE_BD)
    protocolDailyPoints.diversityPoints = protocolDailyPoints.diversityPoints.plus(ONE_BD)
    userWeeklyPoints.diversityPoints = userWeeklyPoints.diversityPoints.plus(ONE_BD)
    protocolWeeklyPoints.diversityPoints = protocolWeeklyPoints.diversityPoints.plus(ONE_BD)

    // Saving all the entities
    userDailyPoints.save()
    protocolDailyPoints.save()
    userWeeklyPoints.save()
    protocolWeeklyPoints.save()       
    }
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


  // Updating loyalty points  
  userDailyStats.loyaltyPoints = newLoyaltyPoints  
  userWeeklyStats.loyaltyPoints = userWeeklyStats.loyaltyPoints.plus(newLoyaltyPoints).minus(oldLoyaltyPoints)
  protocolDailyStats.loyaltyPoints = protocolDailyStats.loyaltyPoints.plus(newLoyaltyPoints).minus(oldLoyaltyPoints)
  protocolWeeklyStats.loyaltyPoints = protocolWeeklyStats.loyaltyPoints.plus(newLoyaltyPoints).minus(oldLoyaltyPoints)

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
    if (save) {
      userPointStat.save();
    }
  }
  return userPointStat as UserPointStat;
}

