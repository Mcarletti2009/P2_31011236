import { Request, Response } from 'express';

export class PaymentController {
  async add(req: Request, res: Response): Promise<void> {
    // Aquí se validarían los datos del formulario de pago y, en evaluaciones futuras,
    // se guardaría o procesaría la información según las normas de PCI DSS.
    res.send("Pago realizado");
  }
}