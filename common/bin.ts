export enum BinType {
  Recycle = 'Recycle',
  Plastic = 'Plastic',
  Organic = 'Organic',
  E_waste = 'E-waste'
}

export interface Bin {
  type: BinType,
  logo: string
}
