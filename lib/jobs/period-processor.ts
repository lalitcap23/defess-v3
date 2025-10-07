import { WinnerSelectionService } from '../services/winner-selection';

export class PeriodProcessor {
  private winnerService: WinnerSelectionService;

  constructor() {
    this.winnerService = new WinnerSelectionService();
  }

  async processPreviousPeriod(): Promise<{ success: boolean; message: string }> {
    try {
      const winner = await this.winnerService.findPreviousPeriodWinner();
      
      if (!winner) {
        return { success: true, message: 'No winner found for previous period' };
      }

      const result = await this.winnerService.processWinner(winner);
      
      if (result.success) {
        return { 
          success: true, 
          message: `Winner processed: ${winner.username} (${result.signature})` 
        };
      } else {
        return { 
          success: false, 
          message: `Failed to process winner: ${result.error}` 
        };
      }

    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}