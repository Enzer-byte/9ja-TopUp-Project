import { Order, SupplierFulfillmentResult, SupplierValidationResult, SupplierType } from '../../types';
import { ISupplierAdapter } from './supplierInterface';

export class MockSupplierAdapter implements ISupplierAdapter {
  readonly supplierType: SupplierType = 'mock';
  readonly name = 'Mock Fast-TopUp Engine (Sandbox)';

  private simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async validatePlayer(gameId: string, playerId: string): Promise<SupplierValidationResult> {
    await this.simulateDelay(600);
    const cleaned = playerId.trim();

    if (!cleaned || cleaned.length < 5) {
      return {
        valid: false,
        error: 'Player ID is too short. Please enter a valid in-game ID.',
      };
    }

    if (cleaned.toLowerCase().includes('invalid')) {
      return {
        valid: false,
        error: 'Publisher returned: Player ID not found. Verify your UID in game.',
      };
    }

    // Mock realistic Nigerian gamer tags
    const mockNames: Record<string, string[]> = {
      free_fire: ['NaijaHunter_99', 'LagosGhost_FF', 'KanoSniper', 'DeltaDemon', 'EkoShadow'],
      codm: ['Ghost_NG_Operative', 'NaijaBeast_COD', 'AbujaStriker', 'IbadanReaper', 'OdogwuGamer'],
    };

    const list = mockNames[gameId] || ['Gamer_NG'];
    const charCodeSum = cleaned.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const mockNick = list[charCodeSum % list.length];

    return {
      valid: true,
      playerName: mockNick,
    };
  }

  async fulfillTopUp(order: Order): Promise<SupplierFulfillmentResult> {
    // Latency simulation (1.2s to 2s)
    await this.simulateDelay(1500);

    // Check if test failure mode is triggered via order flags or test player ID
    if (order.playerId.toLowerCase().includes('fail') || order.customerEmail.toLowerCase().includes('fail')) {
      return {
        success: false,
        errorMessage: 'Publisher fulfillment error: Account region mismatch or temporarily locked.',
        rawResponse: {
          code: 'ERR_PUBLISHER_TIMEOUT',
          message: 'Garena/Activision API rejected request: Region code mismatch',
          orderRef: order.orderRef,
          timestamp: new Date().toISOString(),
        },
      };
    }

    const txId = `MOCK-TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      success: true,
      supplierTxId: txId,
      rawResponse: {
        statusCode: 200,
        status: 'FULFILLED',
        txId,
        orderRef: order.orderRef,
        gameId: order.gameId,
        itemDelivered: order.packageName,
        playerId: order.playerId,
        deliveredAt: new Date().toISOString(),
      },
    };
  }

  async checkTransactionStatus(supplierTxId: string): Promise<{ status: 'SUCCESS' | 'FAILED' | 'PENDING'; details?: string }> {
    await this.simulateDelay(400);
    if (supplierTxId.includes('FAIL')) {
      return { status: 'FAILED', details: 'Transaction failed at distributor' };
    }
    return { status: 'SUCCESS', details: 'Digital currency delivered to player account.' };
  }
}
