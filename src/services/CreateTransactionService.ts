import AppError from '../errors/AppError';
import { getRepository, getCustomRepository } from 'typeorm'

import Transaction from '../models/Transaction'
import Category from '../models/Category'

import TransactionsRepository from '../repositories/TransactionsRepository'

interface Request {
  title: string,
  value: number,
  type: 'income' | 'outcome',
  category: string
}

class CreateTransactionService {
  public async execute({ title, value, type, category }: Request): Promise<Transaction> {
    if (!['income', 'outcome'].includes(type)) throw new AppError('Transaction type is invalid');
    const transactionsRepository = getCustomRepository(TransactionsRepository)
    const { total } = await transactionsRepository.getBalance()
    if (type === 'outcome' && value > total) throw new AppError('You do not have enough balance');
    const categoriesRepository = getRepository(Category)
    let transactionCategory = await categoriesRepository.findOne({ title: category })
    if (!transactionCategory) {
      transactionCategory = categoriesRepository.create({ title: category })
      await categoriesRepository.save(transactionCategory)
    }
    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transactionCategory
    })
    await transactionsRepository.save(transaction)
    return transaction
  }
}

export default CreateTransactionService;
