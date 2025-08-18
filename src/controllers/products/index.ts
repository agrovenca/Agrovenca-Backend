import { handleErrors } from '@/controllers/handleErrors'
import { CartItem, ProductModel } from '@/models/Product'
import {
  validateChangePrices,
  validateProductCreate,
  validateProductUpdate,
} from '@/schemas/products'
import { NotFoundError } from '@/utils/errors'
import { Request, Response } from 'express'
import { exportDataToExcel, ExportDataToExcelType } from '@/utils/export/excel'
import excelJs from 'exceljs'
import { parseQueryArray } from '@/utils/parseQueryArray'
import { getPaginationData } from '@/utils/getPaginationData'
import { getCommonQueryFilters } from '@/utils/getCommonQueryFilters'

export class ProductsController {
  private model: typeof ProductModel

  constructor({ model }: { model: typeof ProductModel }) {
    this.model = model
  }

  getSingle = async (req: Request, res: Response) => {
    const { slug } = req.params

    if (!slug || slug.length < 1) {
      res.status(400).json({ error: 'El slug del producto es necesario' })
      return
    }

    try {
      const object = await this.model.getSingle({ slug })
      if (!object) {
        res.status(404).json({ error: 'No existe el producto', status: 404 })
        return
      }

      res.status(200).json({
        product: object,
        message: 'Producto obtenido exitosamente',
      })
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  getAll = async (req: Request, res: Response) => {
    const { limit, page, search } = getCommonQueryFilters(req.query)
    const inStockOnly = req.query.inStockOnly
    const priceRange = parseQueryArray(
      req.query.priceRange as string | string[] | undefined,
      Number,
    )
    const categoriesId = parseQueryArray(
      req.query.categoriesId as string | string[] | undefined,
      String,
    )
    const unitiesId = parseQueryArray(req.query.unitiesId as string | string[] | undefined, String)

    const numericLimit = limit === 0 ? undefined : Number(limit)
    const offset = numericLimit ? (page - 1) * numericLimit : undefined

    try {
      const { objects, totalItems } = await this.model.getAll({
        offset,
        limit: numericLimit,
        search,
        categoriesId,
        unitiesId,
        priceRange,
        inStockOnly: inStockOnly === undefined ? undefined : inStockOnly === 'true',
      })

      const totalPages = numericLimit ? Math.ceil(totalItems / numericLimit) : 1

      res.json({
        objects,
        pagination: {
          ...getPaginationData({ page, totalItems, totalPages }),
        },
      })
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  create = async (req: Request, res: Response) => {
    const { user } = req

    try {
      if (!user) throw new NotFoundError('Usuario no encontrado')

      const result = validateProductCreate(req.body)

      if (!result.success || !result.data) {
        res.status(400).json({ error: JSON.parse(result.error.message) })
        return
      }

      const newObject = await this.model.create({ userId: user.id, data: result.data })
      res.status(201).json({
        product: newObject,
        message: 'Producto creado correctamente',
      })
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const data = req.body
      const result = validateProductUpdate(data)

      if (!result.success) {
        res.status(400).json({ error: JSON.parse(result.error.message) })
        return
      }

      const updatedObject = await this.model.update({ id, data: result.data })

      res.status(200).json({
        product: updatedObject,
        message: 'Producto actualizado exitosamente',
      })
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  delete = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
      const deletedObject = await this.model.delete({ id })
      res.send({ product: deletedObject, message: 'Producto eliminado exitosamente' })
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  updateOrder = async (req: Request, res: Response) => {
    try {
      const { updatedProducts } = req.body

      if (!Array.isArray(updatedProducts)) {
        res.status(400).json({
          error: 'El cuerpo de la solicitud debe contener un array llamado "updatedProducts"',
        })
        return
      }

      const hasInvalidItem = updatedProducts.some(
        (item) => typeof item.id !== 'string' || typeof item.displayOrder !== 'number',
      )

      if (hasInvalidItem) {
        res
          .status(400)
          .json({ error: 'Cada producto debe tener un "id" (string) y un "displayOrder" (number)' })
        return
      }

      const result = await this.model.updateOrder(updatedProducts)

      res.status(200).json({ message: 'Orden actualizado correctamente', result })
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  updateOrderManual = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { displayOrder } = req.body

      if (typeof id !== 'string' || typeof displayOrder !== 'number') {
        res.status(400).json({
          error:
            'El cuerpo de la solicitud debe contener un "id" (string) y un "displayOrder" (number)',
        })
        return
      }

      const result = await this.model.updateSingleOrder({ id, displayOrder })

      res.status(200).json({
        message: 'Orden actualizado correctamente',
        result: result,
      })
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  export = async (req: Request, res: Response) => {
    try {
      const { format } = req.params
      if (!format || format.length <= 1) {
        res.status(400).json({ message: 'Indique un formato de exportación válido.' })
        return
      }

      const { totalItems: _, objects } = await this.model.getAll({})
      const filename = `productos_${new Date().toISOString().split('T')[0]}`

      if (format.trim() === 'xlsx') {
        const workBookConfig: ExportDataToExcelType = {
          res,
          filename,
          sheetName: 'Products',
          dataToExport: objects,
          columns: [
            { header: 'Slug', key: 'slug', width: 50 },
            { header: 'Nombre', key: 'name', width: 50 },
            { header: 'Descripción', key: 'description', width: 50 },
            { header: 'Precio', key: 'price', width: 10, style: { numFmt: '0.00' } },
            { header: 'Segundo precio', key: 'secondPrice', width: 10, style: { numFmt: '0.00' } },
            { header: 'Stock', key: 'stock', width: 10, style: { numFmt: '0' } },
            { header: 'Envío gratis', key: 'freeShipping', width: 25 },
            { header: 'ID del video', key: 'videoId', width: 25 },
            { header: 'Fecha de creación', key: 'createdAt', width: 25 },
            { header: 'Fecha de actualización', key: 'updatedAt', width: 25 },
            {
              header: 'Orden en pantalla',
              key: 'displayOrder',
              width: 10,
              style: { numFmt: '0' },
            },
            { header: 'Categoría', key: 'categoryId', width: 50 },
            { header: 'Unidad', key: 'unityId', width: 50 },
            { header: 'Creado por', key: 'userId', width: 50 },
          ],
          validations: [
            {
              key: 'price',
              validate: (cell: excelJs.Cell, _rowNumber: number) =>
                (cell.value = Number(cell.value)),
            },
            {
              key: 'secondPrice',
              validate: (cell: excelJs.Cell, _rowNumber: number) =>
                (cell.value = Number(cell.value)),
            },
          ],
        }

        await exportDataToExcel(workBookConfig)
        res.end()
        return
      }

      res.status(400).json({ message: 'Formato de exportación no disponible' })
      return
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  validateCart = async (req: Request, res: Response) => {
    const cartItems: CartItem[] = req.body.items

    const validatedItems = await this.model.validateCart({ items: cartItems })
    res.send({
      items: validatedItems,
      message: 'Productos del carrito validados',
    })
  }

  updatePrices = async (req: Request, res: Response) => {
    try {
      const result = validateChangePrices(req.body)

      if (!result.success) {
        res.status(400).json({ error: JSON.parse(result.error.message) })
        return
      }

      const affected = await this.model.updatePrices(result.data)

      res.status(200).json({ message: 'Precios actualizados correctamente', count: affected })
    } catch (error) {
      handleErrors({ error, res })
    }
  }
}
