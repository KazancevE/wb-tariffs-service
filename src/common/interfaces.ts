export interface WbTariffWarehouse {
  warehouseName: string;
  geoName: string;
  boxDeliveryBase: number;
  boxDeliveryCoefExpr: number;
  boxStorageBase: number;
  boxStorageCoefExpr: number;
  // добавьте другие поля по необходимости
}

export interface WbTariffsResponse {
  dtNextBox: string;
  dtTillMax: string;
  warehouseList: WbTariffWarehouse[];
}
