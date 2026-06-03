import styles from '../../pages/Operations.module.css';

export const TipoEnvio = ({ itemService, sequencedetail, detail, onUpdateServiceFormData }) => {

  return (
    <>
      <label className={styles.fieldLabel}>
        Modalidad
      </label>
      <select
        value={detail.idTypeShipment || ""}
        className={styles.selectInput}
        required
        onChange={(e) => {
          onUpdateServiceFormData(itemService, sequencedetail, 'idTypeShipment', Number(e.target.value))
          onUpdateServiceFormData(itemService, sequencedetail, 'typeShipment', e.target.options[e.target.selectedIndex].text)
        }}>
        <option value="">Seleccionar ...</option>
        <option value={1}>Puerta a Puerta</option>
        <option value={2}>Puerto a Puerto</option>
        <option value={3}>Puerta a Puerto</option>
        <option value={4}>Puerto a Puerta</option>
      </select>
    </>
  );
};

export const TipoReferencia = ({ itemService, sequencedetail, detail, onUpdateServiceFormData }) => {

  return (
    <>
      <label className={styles.fieldLabel}>
        Tipo solicitud de reserva
      </label>
      <select
        value={detail.typeShippingReference || ''}
        className={styles.selectInput}
        // readOnly
        required
        onChange={(e) => {
          onUpdateServiceFormData(itemService, sequencedetail, 'typeShippingReference', e.target.options[e.target.selectedIndex].text)
          // updateService(item, detail.sequence, 'NameShippingReference', e.target.options[e.target.selectedIndex].text)
        }
        }
      >
        <option value="">Seleccionar ...</option>
        <option value={"Booking"}>Booking</option>
        <option value={"Carta porte"}>Carta porte</option>
      </select>
    </>
  );
};

export const TipoOperacion = ({ itemService, sequencedetail, detail, onUpdateServiceFormData }) => {

  return (
    <>
      <label className={styles.fieldLabel}>
        Tipo operación / Operation type
      </label>
      <select
        value={detail.idTypeOperation || ''}
        className={styles.selectInput}
        // readOnly
        required
        onChange={(e) => {
          onUpdateServiceFormData(itemService, sequencedetail, 'idTypeOperation', Number(e.target.value))
          onUpdateServiceFormData(itemService, sequencedetail, 'typeOperation', e.target.options[e.target.selectedIndex].text)
        }
        }>
        <option value="">Seleccionar ...</option>
        <option value={1}>Importación</option>
        <option value={2}>Exportación</option>
        <option value={3}>Nacional</option>
        <option value={4}>Local USA</option>
        <option value={5}>Triangulacion</option>
      </select>
    </>
  );
};

export const Incoterm = ({ itemService, sequencedetail, detail, onUpdateServiceFormData, incoterms }) => {

  return (
    <>
      <label className={styles.fieldLabel}>
        Incoterm
      </label>
      <select
        value={detail.idIncoterm || ''}
        className={styles.selectInput}
        // readOnly
        required
        onChange={(e) => {
          onUpdateServiceFormData(itemService, sequencedetail, 'idIncoterm', Number(e.target.value))
          onUpdateServiceFormData(itemService, sequencedetail, 'incoterm', e.target.options[e.target.selectedIndex].text)
        }
        }
      >
        <option value="">Seleccionar ...</option>
        {incoterms.map((inc) => (
          <option key={inc._Id} value={inc._Id}>{inc.incoterm}</option>
        ))}
      </select>
    </>
  );
};

export const Transportista = ({ itemService, sequencedetail, transport, onUpdateServiceDetail, transportista }) => {

  return (
    <>
      <label className={styles.fieldLabel}>
        Transportista *
      </label>
      <select
        value={transport?.idcarrier || ''}
        className={styles.selectInput}
        // readOnly
        // required
        onChange={(e) => {
          onUpdateServiceDetail(itemService, sequencedetail, 'transport', 'idcarrier', e.target.value)
          onUpdateServiceDetail(itemService, sequencedetail, 'transport', 'carrier', e.target.options[e.target.selectedIndex].text)
          onUpdateServiceDetail(itemService, sequencedetail, 'transport', 'typeCarrier', e.target.options[e.target.selectedIndex].dataset.type === 'Transporte' ? 'Linea transportista' : e.target.options[e.target.selectedIndex].dataset.type)
        }
        }
      >
        <option value="">Seleccionar ...</option>
        {transportista.map((tr) => (
          <option key={tr.id} value={tr.id} data-type={tr.sector_name}>{tr.fiscalData.businessName}</option>
        ))}
      </select>
    </>
  );
};

export const TipoUnidad = ({ itemService, sequencedetail, transport, onUpdateServiceDetail, modalidad }) => {

  const tipoUnidad = [
    { value: "Buque", name: "Buque", modalidad: "maritimo" },
    { value: "Plataforma", name: "Plataforma", modalidad: "terrestre" },
    { value: "Caja seca 20", name: "Caja seca 20", modalidad: "terrestre" },
    { value: "Caja seca 40", name: "Caja seca 40", modalidad: "terrestre" },
    { value: "Caja seca 48", name: "Caja seca 48", modalidad: "terrestre" },
    { value: "Caja seca 53", name: "Caja seca 53", modalidad: "terrestre" },
    { value: "Remolque", name: "Remolque", modalidad: "terrestre" },
    { value: "Nissan", name: "Nissan", modalidad: "terrestre" },
    { value: "Rabón", name: "Rabón", modalidad: "terrestre" },
    { value: "Torton", name: "Torton", modalidad: "terrestre" },
    { value: "PAX", name: "PAX", modalidad: "aereo" }, /* Carga mixta pasajeros y carga con restricciones */
    { value: "CAO", name: "CAO", modalidad: "aereo" } /* Sólo carga (Cargo Aircraft ONLY) */
  ]

  return (
    <>
      <label className={styles.fieldLabel}>
        Tipo unidad
      </label>
      <select
        value={transport?.typeUnit || ''}
        className={styles.selectInput}
        // readOnly
        required
        onChange={(e) => {
          onUpdateServiceDetail(itemService, sequencedetail, 'transport', 'typeUnit', e.target.options[e.target.selectedIndex].text)
        }
        }
      >
        <option value="">Seleccionar ...</option>
        {tipoUnidad.filter(tu => tu.modalidad === modalidad).map((tu) => (
          <option key={tu.value} value={tu.value}>{tu.name}</option>
        ))}

      </select>

    </>
  );
};

export const TipoRuta = ({ itemService, sequencedetail, transport, onUpdateServiceDetail }) => {

  return (
    <>
      <label className={styles.fieldLabel}>
        Tipo ruta
      </label>
      <select
        value={transport?.typeRoute || ''}
        className={styles.selectInput}
        // readOnly
        required
        onChange={(e) => {
          onUpdateServiceDetail(itemService, sequencedetail, 'transport', 'typeRoute', e.target.options[e.target.selectedIndex].text)
        }
        }
      >
        <option value="">Seleccionar ...</option>
        <option value={"Directo"}>Directo</option>
        <option value={"Transbordo"}>Transbordo</option>
      </select>
    </>
  );
};

export const TipoMovimeiento = ({ itemService, sequencedetail, transport, onUpdateServiceDetail }) => {

  return (
    <>
      <label className={styles.fieldLabel}>
        Tipo movimiento
      </label>
      <select
        value={transport?.typeOfMovement || ''}
        className={styles.selectInput}
        // readOnly
        required
        onChange={(e) => {
          onUpdateServiceDetail(itemService, sequencedetail, 'transport', 'typeOfMovement', e.target.options[e.target.selectedIndex].text)
        }
        }
      >
        <option value="">Seleccionar ...</option>
        <option value={"Full"}>Full</option>
        <option value={"Sencillo"}>Sencillo</option>
      </select>
    </>
  );
};

export const TipoGuia = ({ itemService, sequencedetail, transport, onUpdateServiceDetail, modalidad }) => {

  const tipoGuia = [
    //<option value="Master_Bill_Of_Lading">MBL</option>
    { value: "BL", name: "BL", detalle: "Bill_Of_Lading", modalidad: "maritimo" }, //Liberación de carga con original
    { value: "SWB", name: "SWB", detalle: "Sea_WayBill", modalidad: "maritimo" }, //Liberación de carga contra copia
    { value: "HBL", name: "HBL", detalle: "House_Bill_Of_Lading", modalidad: "maritimo" },
    { value: "BOL", name: "BOL", detalle: "Bill_Of_Lading", modalidad: "terrestre" },
    { value: "HAWB", name: "HAWB", detalle: "House_of_Air_Way_Bill", modalidad: "aereo" }
    //<option value="Master_Of_Air_Way_Bill">MAWB</option>
  ]

  return (
    <>
      <div className="flex flex-col gap-1">
        <label className="text-label-md font-label-md text-on-surface-variant">Tipo | Guía</label>
        <div className="flex items-center bg-surface-container focus-within:border-secondary transition-all">
          {/* <!-- Dropdown for Tipo --> */}
          <div className="relative w-1/2">
            <select
              value={transport?.guide?.type || ''}
              className={styles.selectInput}
              id="type"
              // readOnly
              // required
              onChange={(e) => {
                onUpdateServiceDetail(itemService, sequencedetail, 'transport', 
                  'guide', {
                    'type': e.target.value
                  }
                ) 
              }
              }
            >
              <option value="">Selec...</option>
              {tipoGuia.filter(tg => tg.modalidad === modalidad).map((tg) => (
                <option key={tg.value} value={tg.value}>{tg.name}</option>
              ))}

            </select>
          </div>

          {/* <!-- Vertical Divider --> */}
          <div className="h-6 w-px bg-outline-variant dark:text-white"></div>

          <input
            type="text"
            className={styles.textInput}
            id="guide"
            value={transport?.guide?.guide || ''}
            onChange={(e) => {
              onUpdateServiceDetail(itemService, sequencedetail, 'transport', 
                'guide', {
                  'guide': e.target.value
                }
              ) 
            }
            }
          />
        </div>
      </div>

    </>
  )
}

export const UnidadMedida = ({ itemService, sequencedetail, goods, onUpdateServiceFormData }) => {

  return (
    <>
      <div className={styles.measureContainer}>

        {/* Unidad */}
        <select
          value={goods?.idUnitMeasurement || ''}
          className= {styles.measureSelect}
          onChange={(e) => {
            onUpdateServiceFormData(
              itemService,
              sequencedetail,
              'goods',
              [{
                ...(goods || {}),
                idUnitMeasurement: Number(e.target.value),
                unitMeasurement:
                  e.target.options[e.target.selectedIndex].text
              }]
            );
          }}
        >
          <option value="">...</option>
          <option value={1}>cm</option>
          <option value={2}>in</option>
        </select>

        {/* Separador */}
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>

        {/* Valor */}
        <input
          type="text"
          value={goods?.volumeTotal || ''}
          className= {styles.measureInput}
          onChange={(e) => {
            onUpdateServiceFormData(
              itemService,
              sequencedetail,
              'goods',
              [{
                ...(goods || {}),
                volumeTotal: e.target.value
              }]
            );
          }}
        />

      </div>

    </>
  )

};

export const TipoCarga = ({ itemService, sequencedetail, goods, onUpdateServiceFormData }) => {

  return (
    <>
      <select
        value={goods?.shipmentTypeCargo || goods?.typeCargo || ''}
        className={styles.selectTable}
        // readOnly
        required
        onChange={(e) => {
          onUpdateServiceFormData(itemService, sequencedetail, 'goods', [{
            ...(goods || {}),
            typeCargo: e.target.value
          }])
        }
        }
      >
        <option value=''>Seleccionar ...</option>
        <option value={"Contenerizada"}>Contenerizada</option>
        <option value={"Suelta"}>Suelta</option>
      </select>
    </>
  );
};

export const TipoClasificacion = ({ itemService, sequencedetail, goods, onUpdateServiceFormData }) => {

  return (
    <>
      <select
        value={goods?.idUnitMeasurement || ''}
        className={styles.selectTable}
        // readOnly
        required
        onChange={(e) => {
          onUpdateServiceFormData(itemService, sequencedetail, 'goods', [{
            ...(goods || {}),
            idUnitMeasurement: e.target.value,
            unitMeasurement: e.target.options[e.target.selectedIndex].text
          }])
        }
        }
      >
        <option value=''>Seleccionar ...</option>
        <option value={1}>Peligrosa</option>
        <option value={2}>Refrigerada</option>
        <option value={3}>Sobredimensionada</option>
        <option value={4}>Granel</option>
        <option value={5}>General</option>
      </select>
    </>
  );
};

export const TipoEmbalaje = ({ itemService, sequencedetail, goods, onUpdateServiceFormData }) => {

  return (
    <>
      <select
        value={goods?.idUnitMeasurement || ''}
        className={styles.selectTable}
        // readOnly
        required
        onChange={(e) => {
          onUpdateServiceFormData(itemService, sequencedetail, 'goods', [{
            ...(goods || {}),
            idUnitMeasurement: e.target.value,
            unitMeasurement: e.target.options[e.target.selectedIndex].text
          }])
        }
        }
      >
        <option value=''>Seleccionar ...</option>
        <option value={1}>Caja</option>
        <option value={2}>Pallet</option>
        <option value={3}>Saco</option>
      </select>
    </>
  );
};

export const Goods = ({ infoControl, detail, onUpdateServiceFormData }) => {

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.colItem}>Item</th>
          <th className={styles.colGoods}>Mercancía</th>
          <th className={styles.colDescription}>Descripción</th>
          <th className={styles.colPieces}>Piezas</th>
          <th className={styles.colMeasure}>Unidad de medida</th>
          <th className={styles.colCargo}>Tipo de carga</th>
        </tr>
      </thead>
      <tbody>
        {detail.goods?.map((good, index) => (
          <tr key={good.idgood ? good.idgood : 1}>
            <td>
              {/* Item */}
              <label className="px-2 py-1">
                # {index + 1}
                {/* # {good.idgood ? good.idgood : index + 1} */}
              </label>
            </td>
            <td>
              {/* Mercancia */}
              <input
                className={styles.textTable}
                value={good?.name || ''}
                onChange={(e) => {
                  onUpdateServiceFormData(
                    infoControl.idServiceItem,
                    detail.sequence,
                    'goods',
                    [{
                      ...(detail.goods?.[detail.goods?.indexOf(good) ?? 0] ?? {}),
                      name: e.target.value,
                    }]
                  )
                }
                }
              />
            </td>
            <td>
              {/* Descripción */}
              <input
                className={styles.textTable}
                value={good?.description || ''}
                onChange={(e) =>
                  onUpdateServiceFormData(
                    infoControl.idServiceItem,
                    detail.sequence,
                    'goods',
                    [{
                      ...(detail.goods?.[detail.goods?.indexOf(good) ?? 0] ?? {}),
                      description: e.target.value
                    }]
                  )
                }
              />
            </td>
            <td>
              {/* Piezas */}
              <input
                type="number"
                className={styles.smallInput}
                value={good?.pieces || good?.numberOfPieces || ''}
                onChange={(e) =>
                  onUpdateServiceFormData(
                    infoControl.idServiceItem,
                    detail.sequence,
                    'goods',
                    [{
                      ...(detail.goods?.[detail.goods?.indexOf(good) ?? 0] ?? {}),
                      numberOfPieces: Number(e.target.value)
                    }]
                  )
                }
              />
            </td>
            <td>
              <UnidadMedida
                itemService={infoControl.idServiceItem}
                sequencedetail={detail.sequence}
                goods={good}
                onUpdateServiceFormData={onUpdateServiceFormData}
              />
            </td>
            <td>
              {/* Tipo de carga */}
              <TipoCarga
                itemService={infoControl.idServiceItem}
                sequencedetail={detail.sequence}
                goods={good}
                onUpdateServiceFormData={onUpdateServiceFormData}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}