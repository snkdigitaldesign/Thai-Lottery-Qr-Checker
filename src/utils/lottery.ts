
export const PRIZE_AMOUNTS: Record<string, number> = {
  FIRST_PRIZE: 6000000,
  FIRST_PRIZE_NEIGHBORS: 100000,
  SECOND_PRIZE: 200000,
  THIRD_PRIZE: 80000,
  FOURTH_PRIZE: 40000,
  FIFTH_PRIZE: 20000,
  FRONT_THREE: 4000,
  BACK_THREE: 4000,
  LAST_TWO: 2000,
};

export const PRIZE_NAMES: Record<string, string> = {
  FIRST_PRIZE: "รางวัลที่ 1",
  FIRST_PRIZE_NEIGHBORS: "รางวัลข้างเคียงรางวัลที่ 1",
  SECOND_PRIZE: "รางวัลที่ 2",
  THIRD_PRIZE: "รางวัลที่ 3",
  FOURTH_PRIZE: "รางวัลที่ 4",
  FIFTH_PRIZE: "รางวัลที่ 5",
  FRONT_THREE: "เลขหน้า 3 ตัว",
  BACK_THREE: "เลขท้าย 3 ตัว",
  LAST_TWO: "เลขท้าย 2 ตัว",
};

export interface CheckResult {
  draw_date: string;
  number: string;
  is_winner: boolean;
  prizes: string[];
  total_prize: number;
}

export function checkLottery(number: string, draw: any): CheckResult {
  let isWinner = false;
  let prizes: string[] = [];

  if (number === draw.first_prize) {
    isWinner = true;
    prizes.push("FIRST_PRIZE");
  }

  // First Prize Neighbors
  const firstPrizeInt = parseInt(draw.first_prize);
  const neighbor1 = (firstPrizeInt === 0 ? 999999 : firstPrizeInt - 1).toString().padStart(6, '0');
  const neighbor2 = (firstPrizeInt === 999999 ? 0 : firstPrizeInt + 1).toString().padStart(6, '0');
  
  if (number === neighbor1 || number === neighbor2) {
    isWinner = true;
    prizes.push("FIRST_PRIZE_NEIGHBORS");
  }

  if (draw.front_three.includes(number.substring(0, 3))) {
    isWinner = true;
    prizes.push("FRONT_THREE");
  }

  if (draw.back_three.includes(number.substring(3, 6))) {
    isWinner = true;
    prizes.push("BACK_THREE");
  }

  if (number.substring(4, 6) === draw.last_two) {
    isWinner = true;
    prizes.push("LAST_TWO");
  }

  if (draw.second_prize?.includes(number)) {
    isWinner = true;
    prizes.push("SECOND_PRIZE");
  }

  if (draw.third_prize?.includes(number)) {
    isWinner = true;
    prizes.push("THIRD_PRIZE");
  }

  if (draw.fourth_prize?.includes(number)) {
    isWinner = true;
    prizes.push("FOURTH_PRIZE");
  }

  if (draw.fifth_prize?.includes(number)) {
    isWinner = true;
    prizes.push("FIFTH_PRIZE");
  }

  const totalPrize = prizes.reduce((sum, prize) => sum + (PRIZE_AMOUNTS[prize] || 0), 0);

  return {
    draw_date: draw.draw_date,
    number,
    is_winner: isWinner,
    prizes,
    total_prize: totalPrize,
  };
}
