import { getCustomRepository, getRepository, In } from 'typeorm'
import fs = require('fs')
import csvParse = require('csv-parse')

import Transaction from '../models/Transaction';
import Category from '../models/Category'
import TransactionRepository from '../repositories/TransactionsRepository'

interface CsvTransaction {
  title: string,
  value: number,
  type: 'income' | 'outcome',
  category: string
}

interface CategoryInterface {
  id: string,
  title: string,
  created_at: Date,
  updated_at: Date
}

const addCategoriesIfNeeded = async (categories: string[]) => {
  const categoriesRepository = getRepository(Category)
  const existingCategories = await categoriesRepository.find({ where: { title: In(categories) }})
  const existingCategoriesTitles = existingCategories.map(category => category.title)
  const categoriesToAdd = categories
    .filter(category => !existingCategoriesTitles.includes(category))
    .filter((value, index, arr) => arr.indexOf(value) === index)
  const newCategories = categoriesRepository.create(categoriesToAdd.map(title => ({ title })))
  await categoriesRepository.save(newCategories)
  return [...newCategories, ...existingCategories]
}

const getCategory = (categories: Category[], categoryTitleToFind: string) => categories.find(category => category.title === categoryTitleToFind)

const addTransactions = async (transactions: CsvTransaction[], categories: CategoryInterface[]) => {
  const transactionRepository = getCustomRepository(TransactionRepository)
  const createdTransactions = transactionRepository.create(transactions.map(transaction => ({
    title: transaction.title,
    type: transaction.type,
    value: transaction.value,
    category: getCategory(categories, transaction.category)
  })))
  await transactionRepository.save(createdTransactions)
  return createdTransactions
}
const parseCsv = async (filePath: string) => {
  const contactReadStream = fs.createReadStream(filePath)
  const parser = csvParse({ fromLine: 2 })
  const parseCsv = contactReadStream.pipe(parser)
  const transactions: CsvTransaction[] = []
  const categories: string[] = []
  parseCsv.on('data', async line => {
    const [title, type, value, category] = line.map((cell: string) => cell.trim())
    if (!title || !type || !value) return
    categories.push(category)
    transactions.push({ title, type, value, category})
  })
  await new Promise(resolve => parseCsv.on('end', resolve))
  return { categories, transactions }
}
class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const { categories, transactions } = await parseCsv(filePath)
    const finalCategories = await addCategoriesIfNeeded(categories)
    const finalTransactions = await addTransactions(transactions, finalCategories)
    await fs.promises.unlink(filePath)
    return finalTransactions
  }
}

export default ImportTransactionsService;
