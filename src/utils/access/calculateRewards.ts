import { BigDecimal, log } from "@graphprotocol/graph-ts";
import { AggregateTradingStat,UserPointStat } from "../../types/schema";
import {ZERO_BD,EPOCH_TYPE,determineEpochNumber,PROTOCOL} from "../constants";
import {TOTAL_WEEKLY_REWARDS, TOTAL_WEEKLY_POINTS, LOYALTY_WEIGHT,
         VOLUME_WEIGHT, SKILL_WEIGHT, HUNDRED} from "../points_weights"

export function _updateRewardsEntities(
  address: string,
  epochNumber: i32,
  dayNumber:i32,
  weeklyUserPnl:BigDecimal,
  weeklyProtocolPnl:BigDecimal,
  dailyUserFees:BigDecimal,
  weeklyUserFees:BigDecimal,
  weeklyProtocolFees:BigDecimal
):void{
  const id = generateId(address, epochNumber);
  const protocolId = generateId("protocol", epochNumber);
  // load both user points and user reward entities
  let userPoints = UserPointStat.load(id);
  let protocolPoints = UserPointStat.load(protocolId);
  // if not initialized, create new userPointStat entity
  if (userPoints == null) {
      userPoints = new UserPointStat(id);
      userPoints.address = address
      userPoints.weekNumber = epochNumber
      userPoints.loyaltyPoints = BigDecimal.fromString("0")
      userPoints.skillPoints = BigDecimal.fromString("0")
      userPoints.volumePoints = BigDecimal.fromString("0")
      userPoints.totalPoints = BigDecimal.fromString("0")
      userPoints.loyaltyPointsPerDay = []
  }

  // if not initialized, create new protocolPointStat entity, this will be only done once in start of week
  if (protocolPoints == null) {
    protocolPoints = new UserPointStat(protocolId);
    protocolPoints.address = "protocol"
    protocolPoints.weekNumber = epochNumber
    protocolPoints.loyaltyPoints = BigDecimal.fromString("0")
    protocolPoints.skillPoints = BigDecimal.fromString("0")
    protocolPoints.volumePoints = BigDecimal.fromString("0")
    protocolPoints.totalPoints = BigDecimal.fromString("0")
    protocolPoints.loyaltyPointsPerDay = []
}  

  // calculate loyalty points and rewards for the given week
  let loyaltypoints = BigDecimal.fromString("0")
  let protocolpoints = BigDecimal.fromString("0")  
  let totalPoints = BigDecimal.fromString("0")
  let points = BigDecimal.fromString("0")
  if(dailyUserFees > ZERO_BD){
    points = calculateLoyaltyPoints(dailyUserFees)
    let pointsArr = userPoints.loyaltyPointsPerDay
    if(pointsArr.length >0) {
      for (let i =0; i< pointsArr.length; i++) {
        totalPoints.plus(pointsArr[i])
      }    
    }
    loyaltypoints = totalPoints.plus(points)
    protocolpoints = (protocolPoints.loyaltyPoints).plus(loyaltypoints)    
  }  
  // calculate volume points and rewards for the given week
  let volumepoints = BigDecimal.fromString("0")
  if(weeklyUserFees >ZERO_BD && weeklyProtocolFees >ZERO_BD){
    volumepoints = calculateVolumePoints(weeklyUserFees,weeklyProtocolFees)
  }
  // calculate skill points and rewards for the given week
  // might have to add a positive pnl field to AggregateTradingStat
  let skillpoints = BigDecimal.fromString("0")
  if(weeklyUserPnl >ZERO_BD && weeklyProtocolPnl >ZERO_BD){
    skillpoints = calculateSkillPoints(weeklyUserPnl,weeklyProtocolPnl)
  }
  // calculating total points and rewards for the given week
  let totalpoints = loyaltypoints.plus(volumepoints).plus(skillpoints)

  // updating loyalty points
  userPoints.loyaltyPoints = loyaltypoints
  userPoints.volumePoints = volumepoints
  userPoints.skillPoints = skillpoints
  userPoints.totalPoints = totalpoints
  userPoints.loyaltyPointsPerDay[dayNumber] = points
  userPoints.save();

  // updating protocol points
  protocolPoints.loyaltyPoints = (protocolPoints.loyaltyPoints).plus(loyaltypoints)
  protocolPoints.volumePoints = (protocolPoints.volumePoints).plus(volumepoints)
  protocolPoints.skillPoints = (protocolPoints.skillPoints).plus(skillpoints)
  protocolPoints.totalPoints = (protocolPoints.totalPoints).plus(totalpoints)
  protocolPoints.save();  

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
  userVolume: BigDecimal,
  protocolVolume:BigDecimal
):BigDecimal{
  let numPoints = userVolume.times(VOLUME_WEIGHT).times(TOTAL_WEEKLY_POINTS)
  let divisorPoints = protocolVolume.times(HUNDRED)
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

export function generateId(
  address: string,
  epochNumber: i32
): string {
  return address +  "-" + epochNumber.toString();
}