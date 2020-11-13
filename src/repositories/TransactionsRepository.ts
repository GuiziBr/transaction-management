import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}
@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find()
    const { income, outcome } = transactions.reduce((acc, transaction) => {
      switch (transaction.type) {
        case 'income':
          acc.income += transaction.value;
          break;
        case 'outcome':
          acc.outcome += transaction.value;
          break;
        default:
          break;
      }
      return acc;
    }, { income: 0, outcome: 0, total: 0 });
    return {
      income,
      outcome,
      total: income - outcome
    }
  }
}

export default TransactionsRepository;
