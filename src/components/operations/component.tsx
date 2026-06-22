import styles from '../../pages/Operations.module.css';
import { Plus, Trash2, Eye, X, Copy, Search, Trash } from 'lucide-react';
import { formatDateTimeLocal } from '../../types/operations';
import { useLanguage } from "../../contexts/LanguageContext";


export const TipoEnvio = ({ idControl, idService, itemService, sequencedetail, detail, onUpdateServiceFormData, label, required }) => {

  return (
    <>
      <label className={styles.fieldLabel}>
        {required ? <span className={styles.required}>* </span> : ""} {label}
      </label>
      <select
        value={detail.idTypeShipment || ""}
        className={styles.selectInput}
        //disabled = {sequencedetail === 1 ? true : false }
        required = {required}
        data-error-message="Tipo de envio requerido"
        onChange={(e) => {
          onUpdateServiceFormData(idControl, idService, itemService, sequencedetail, 'idTypeShipment', Number(e.target.value))
          onUpdateServiceFormData(idControl, idService, itemService, sequencedetail, 'typeShipment', e.target.options[e.target.selectedIndex].text)
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

// export const TipoReferencia = ({ itemService, sequencedetail, detail, onUpdateServiceFormData }) => {

//   return (
//     <>
//       <label className={styles.fieldLabel}>
//         Tipo solicitud de reserva
//       </label>
//       <select
//         value={detail.typeShippingReference || ''}
//         className={styles.selectInput}
//         // readOnly
//         required
//         onChange={(e) => {
//           onUpdateServiceFormData(itemService, sequencedetail, 'typeShippingReference', e.target.options[e.target.selectedIndex].text)
//           // updateService(item, detail.sequence, 'NameShippingReference', e.target.options[e.target.selectedIndex].text)
//         }
//         }
//       >
//         <option value="">Seleccionar ...</option>
//         <option value={"Booking"}>Booking</option>
//         <option value={"Carta porte"}>Carta porte</option>
//       </select>
//     </>
//   );
// };

export const TipoOperacion = ({ idControl, idService,  itemService, sequencedetail, detail, onUpdateServiceFormData, label, required }) => {

  return (
    <>
      <label className={styles.fieldLabel}>
        {required ? <span className={styles.required}>* </span> : ""} {label}
      </label>
      <select
        value={detail.idTypeOperation || ''}
        className={styles.selectInput}
        //disabled = {sequencedetail === 1 ? true : false }
        required = {required}
        data-error-message="Tipo de operación requerido"
        onChange={(e) => {
          onUpdateServiceFormData(idControl, idService, itemService, sequencedetail, 'idTypeOperation', Number(e.target.value))
          onUpdateServiceFormData(idControl, idService, itemService, sequencedetail, 'typeOperation', e.target.options[e.target.selectedIndex].text)
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

export const Incoterm = ({ idControl, idService, itemService, sequencedetail, detail, onUpdateServiceFormData, incoterms, label, required }) => {

  return (
    <>
      <label className={styles.fieldLabel}>
        {required ? <span className={styles.required}>* </span> : ""} {label}
      </label>
      <select
        value={detail.idIncoterm || ''}
        className={styles.selectInput}
        //disabled = {sequencedetail === 1 ? true : false }
        required = {required}
        data-error-message="Incoterm requerido"
        onChange={(e) => {
          onUpdateServiceFormData(idControl, idService, itemService, sequencedetail, 'idIncoterm', Number(e.target.value))
          onUpdateServiceFormData(idControl, idService, itemService, sequencedetail, 'incoterm', e.target.options[e.target.selectedIndex].text)
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

export const Transportista = ({ idControl, idService, itemService, sequencedetail, transport, onUpdateServiceDetail, transportista, label, required }) => {
  const { t } = useLanguage();  
  return (
    <>
      <label className={styles.fieldLabel}>
        {required ? <span className={styles.required}>* </span> : ""} {label}
      </label>
      <select
        value={transport?.idcarrier || ''}
        className={styles.selectInput}
        disabled = {false}
        required = {required}
        data-error-message={t("operations.carrierRequired")}
        onChange={(e) => {
          onUpdateServiceDetail(idControl, idService, itemService, sequencedetail, 'transport', 'idcarrier', e.target.value)
          onUpdateServiceDetail(idControl, idService, itemService, sequencedetail, 'transport', 'carrier', e.target.options[e.target.selectedIndex].text)
          onUpdateServiceDetail(idControl, idService, itemService, sequencedetail, 'transport', 'typeCarrier', e.target.options[e.target.selectedIndex].dataset.type === 'Transporte' ? 'Linea transportista' : e.target.options[e.target.selectedIndex].dataset.type)
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

export const TipoUnidad = ({ idControl, idService, itemService, sequencedetail, transport, onUpdateServiceDetail, modalidad, label, required }) => {

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
        {required ? <span className={styles.required}>* </span> : ""} {label}
      </label>
      <select
        value={transport?.typeUnit || ''}
        className={styles.selectInput}
        disabled = {false}
        required = {required}
        data-error-message="Tipo de unidad requerido"
        onChange={(e) => {
          onUpdateServiceDetail(idControl, idService, itemService, sequencedetail, 'transport', 'typeUnit', e.target.options[e.target.selectedIndex].text)
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

export const TipoRuta = ({ idControl, idService, itemService, sequencedetail, transport, onUpdateServiceDetail, label, required }) => {

  return (
    <>
      <label className={styles.fieldLabel}>
        {required ? <span className={styles.required}>* </span> : ""} {label}
      </label>
      <select
        value={transport?.typeRoute || ''}
        className={styles.selectInput}
        disabled = {false}
        required = {required}
        data-error-message="Tipo de ruta requerido"
        onChange={(e) => {
          onUpdateServiceDetail(idControl, idService, itemService, sequencedetail, 'transport', 'typeRoute', e.target.options[e.target.selectedIndex].text)
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

export const TipoMovimeiento = ({ idControl, idService, itemService, sequencedetail, transport, onUpdateServiceDetail, label, required }) => {

  return (
    <>
      <label className={styles.fieldLabel}>
        {required ? <span className={styles.required}>* </span> : ""} {label}
      </label>
      <select
        value={transport?.typeOfMovement || ''}
        className={styles.selectInput}
        disabled = {false}
        required = {required}
        onChange={(e) => {
          onUpdateServiceDetail(idControl, idService, itemService, sequencedetail, 'transport', 'typeOfMovement', e.target.options[e.target.selectedIndex].text)
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

export const TipoGuia = ({ idControl, idService, itemService, sequencedetail, transport, onUpdateServiceDetail, modalidad, label, required }) => {

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
        <label className="text-label-md font-label-md text-on-surface-variant">
          {required ? <span className={styles.required}>* </span> : ""} {label}
        </label>
        <div className="flex items-center bg-surface-container focus-within:border-secondary transition-all">
          {/* <!-- Dropdown for Tipo --> */}
          <div className="relative w-1/2">
            <select
              value={transport?.guide?.type || ''}
              className={styles.selectInput}
              id="type"
              disabled = {false}
              required = {required}
              data-error-message="Tipo de guia requerido"
              onChange={(e) => {
                onUpdateServiceDetail(idControl, idService, itemService, sequencedetail, 'transport',
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
            disabled = {false}
            required = {required}
            value={transport?.guide?.guide || ''}
            onChange={(e) => {
              onUpdateServiceDetail(idControl, idService, itemService, sequencedetail, 'transport',
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

export const UnidadMedida = ({ idControl, idService, itemService, sequencedetail, cargo, onUpdateServiceFormData }) => {

  return (
    <>
      <div className={styles.measureContainer}>

        {/* Unidad */}
        <select
          value={cargo?.idUnitMeasurement || ''}
          className={styles.measureSelect}
          onChange={(e) => {
            onUpdateServiceFormData(idControl, idService, itemService, sequencedetail,
              'cargo',
              [{
                ...(cargo || {}),
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
          type="number"
          value={cargo?.volumeTotal || 0}
          className={styles.measureInput}
          onChange={(e) => {
            onUpdateServiceFormData(idControl, idService, itemService, sequencedetail,
              'cargo',
              [{
                ...(cargo || {}),
                volumeTotal: Number(e.target.value)
              }]
            );
          }}
        />

      </div>

    </>
  )
};

export const TipoCarga = ({ idControl, idService, itemService, sequencedetail, cargo, onUpdateServiceFormData }) => {

  return (
    <>
      <select
        value={cargo?.shipmentTypeCargo || cargo?.typeCargo || ''}
        className={styles.selectTable}
        // readOnly
        required
        onChange={(e) => {
          onUpdateServiceFormData(idControl, idService, itemService, sequencedetail, 
            'cargo', [{
            ...(cargo || {}),
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

export const TipoClasificacion = ({ idControl, idService, itemService, sequencedetail, cargo, onUpdateServiceFormData }) => {

  return (
    <>
      <select
        value={cargo?.idUnitMeasurement || ''}
        className={styles.selectTable}
        // readOnly
        required
        onChange={(e) => {
          onUpdateServiceFormData(idControl, idService, itemService, sequencedetail, 
            'cargo', [{
            ...(cargo || {}),
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

export const TipoEmbalaje = ({ idControl, idService, itemService, sequencedetail, cargo, onUpdateServiceFormData }) => {

  return (
    <>
      <select
        value={cargo?.idUnitMeasurement || ''}
        className={styles.selectTable}
        // readOnly
        required
        onChange={(e) => {
          onUpdateServiceFormData(idControl, idService, itemService, sequencedetail,
            'cargo', [{
            ...(cargo || {}),
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

export const Cargo = ({ idControl, idService, infoControl, detail, onUpdateServiceFormData }) => {

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.colItem}>Item</th>
          <th className={styles.colCargo}>Mercancía</th>
          {/* <th className={styles.colDescription}>Descripción</th> */}
          <th className={styles.colPieces}>Piezas</th>
          <th className={styles.colMeasure}>Unidad de medida</th>
          <th className={styles.colCargo}>Tipo de carga</th>
        </tr>
      </thead>
      <tbody>
        {detail.cargo?.map((cargo, index) => (
          <tr key={cargo.idcargo ? cargo.idcargo : index + 1}>
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
                value={cargo?.name || ''}
                onChange={(e) => {
                  onUpdateServiceFormData(idControl, idService,
                    infoControl.idServiceItem,
                    detail.sequence,
                    'cargo',
                    [{
                      ...(detail.cargo?.[detail.cargo?.indexOf(cargo) ?? 0] ?? {}),
                      name: e.target.value,
                    }]
                  )
                }
                }
              />
            </td>
            {/* <td>
              {/* Descripción * 
              <input
                className={styles.textTable}
                value={cargo?.description || ''}
                onChange={(e) =>
                  onUpdateServiceFormData(
                    infoControl.idServiceItem,
                    detail.sequence,
                    'cargo',
                    [{
                      ...(detail.cargo?.[detail.cargo?.indexOf(cargo) ?? 0] ?? {}),
                      description: e.target.value
                    }]
                  )
                }
              />
            </td> */}
            <td>
              {/* Piezas */}
              <input
                type="number"
                className={styles.smallInput}
                value={cargo?.pieces || cargo?.numberOfPieces || ''}
                onChange={(e) =>
                  onUpdateServiceFormData(
                    infoControl.idServiceItem,
                    detail.sequence,
                    'cargo',
                    [{
                      ...(detail.cargo?.[detail.cargo?.indexOf(cargo) ?? 0] ?? {}),
                      numberOfPieces: Number(e.target.value)
                    }]
                  )
                }
              />
            </td>
            <td>
              <UnidadMedida
                idControl={infoControl?.idControl}
                idService={infoControl?.idService}
                itemService={infoControl.idServiceItem}
                sequencedetail={detail.sequence}
                cargo={cargo}
                onUpdateServiceFormData={onUpdateServiceFormData}
              />
            </td>
            <td>
              {/* Tipo de carga */}
              <TipoCarga
                idControl={infoControl?.idControl}
                idService={infoControl?.idService}
                itemService={infoControl.idServiceItem}
                sequencedetail={detail.sequence}
                cargo={cargo}
                onUpdateServiceFormData={onUpdateServiceFormData}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export const Containers = ({ idControl, idService, infoControl, detail, onUpdateServiceFormData }) => {

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.colItem}>Item</th>
          <th className={styles.colGoods}>Tipo de contenedor</th>
          <th className={styles.colDescription}>Número de contenedor</th>
          <th className={styles.colPieces}>Seal</th>
        </tr>
      </thead>
      <tbody>
        {detail.containers?.map((container, index) => (
          <tr key={container.idcontainer ? container.idcontainer : index + 1}>
            <td>
              {/* Item */}
              <label className="px-2 py-1">
                # {index + 1}
              </label>
            </td>
            <td>
              {/* Tipo de contenedor */}
              <input
                className={styles.textTable}
                value={container?.nameTypeContainer || ''}
                onChange={(e) => {
                  onUpdateServiceFormData(idControl, idService, infoControl.idServiceItem, detail.sequence,
                    'containers',
                    [{
                      ...(detail.containers?.[detail.containers?.indexOf(container) ?? 0] ?? {}),
                      nameTypeContainer: e.target.value,
                    }]
                  )
                }
                }
              />
            </td>
            <td>
              {/* Número de contenedor */}
              <input
                className={styles.textTable}
                value={container?.number || ''}
                onChange={(e) =>
                  onUpdateServiceFormData(idControl, idService, infoControl.idServiceItem, detail.sequence,
                    'containers',
                    [{
                      ...(detail.containers?.[detail.containers?.indexOf(container) ?? 0] ?? {}),
                      number: e.target.value,
                    }]
                  )
                }
              />
            </td>
            <td>
              {/* Seal */}
              <input
                className={styles.textTable}
                value={container?.seal || ''}
                onChange={(e) =>
                  onUpdateServiceFormData(idControl, idService, infoControl.idServiceItem, detail.sequence,
                    'containers',
                    [{
                      ...(detail.containers?.[detail.containers?.indexOf(container) ?? 0] ?? {}),
                      seal: e.target.value,
                    }]
                  )
                }
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
};

export const ReferencesAduanal = ({ idControl, idService, infoControl, detail, onUpdateServiceFormData }) => {
  return (
    <div>
      <div className="flex flex-1 gap-2 border border-gray-200 dark:border-gray-700 rounded-tr-xl rounded-tl-xl p-2 w-1/4">
        <button type="button" className={styles.iconButton} >
          <Plus size={18} />
        </button>
        <button type="button" className={styles.iconButton}>
          <Copy size={18} />
        </button>
        <button type="button" className={styles.iconButton}>
          <Trash size={18} />
        </button>
        <div className="relative w-50">
          <input
            type="text"
            className={styles.textTable} />
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300"
            size={18}
          />
        </div>

      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.colItem}>Item</th>
            <th className={styles.colItem}></th>
            <th className={styles.colGoods}>Referencia</th>
            <th className={styles.colGoods}>Pedimento</th>
            <th className={styles.colDescription}>Guia</th>
            <th className={styles.colDescription}>Proveedor</th>
            <th className={styles.colDescription}>Facturas</th>
            <th className={styles.colPieces}></th>
          </tr>
        </thead>
        <tbody>
          {detail?.references?.map((reference, index) => (
            <tr key={reference.id ? reference.id : 1}>
              <td>
                {/* Item */}
                <label className="px-2 py-1">
                  {index + 1}
                  {/* # {good.idgood ? good.idgood : index + 1} */}
                </label>
              </td>
              <td>
                {/* checkbox */}
                <input
                  type='checkbox'
                />
              </td>
              <td>
                {/* Referencias */}
                <input
                  type="text"
                  className={styles.textTable}
                  value={reference?.reference || ''}
                  onChange={(e) => {
                    onUpdateServiceFormData(idControl, idService, infoControl.idServiceItem, detail.sequence,
                      'references',
                      [{
                        ...(detail.references?.[detail.references?.indexOf(reference) ?? 0] ?? {}),
                        reference: e.target.value,
                      }]
                    )
                  }
                  }
                />
              </td>
              <td>
                {/* Pedimento */}
                <input
                  type="text"
                  className={styles.textTable}
                  value={reference?.pediment || ''}
                  onChange={(e) =>
                    onUpdateServiceFormData(idControl, idService, infoControl.idServiceItem, detail.sequence,
                      'references',
                      [{
                        ...(detail.references?.[detail.references?.indexOf(reference) ?? 0] ?? {}),
                        description: e.target.value
                      }]
                    )
                  }
                />
              </td>
              <td>
                {/* Guia */}
                <input
                  type="text"
                  className={styles.textTable}
                  value={reference?.guide || ''}
                  onChange={(e) =>
                    onUpdateServiceFormData(idControl, idService, infoControl.idServiceItem, detail.sequence,
                      'references',
                      [{
                        ...(detail.references?.[detail.cargo?.indexOf(reference) ?? 0] ?? {}),
                        numberOfPieces: e.target.value
                      }]
                    )
                  }
                />
              </td>
              <td>
                {/* Proveedor */}
                <input
                  type="text"
                  className={styles.textTable}
                  value={reference?.supplier || ''}
                  onChange={(e) =>
                    onUpdateServiceFormData(idControl, idService, infoControl.idServiceItem, detail.sequence,
                      'references',
                      [{
                        ...(detail.references?.[detail.references?.indexOf(reference) ?? 0] ?? {}),
                        numberOfPieces: e.target.value
                      }]
                    )
                  }
                />
              </td>
              <td>
                {/* Facturas */}
                <input
                  type="text"
                  className={styles.textTable}
                  value={reference?.invoice || ''}
                  onChange={(e) =>
                    onUpdateServiceFormData(idControl, idService, infoControl.idServiceItem, detail.sequence,
                      'references',
                      [{
                        ...(detail.references?.[detail.references?.indexOf(reference) ?? 0] ?? {}),
                        numberOfPieces: e.target.value
                      }]
                    )
                  }
                />
              </td>
              <td>
                {/* Botones Ver y Delete */}
                <div className={styles.serviceActions}>
                  <button
                    type="button"
                    className={styles.iconButton}
                    title="delete"
                  //onClick={() => onRemoveMerchandise(service.idServiceItem, merch)}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    title="ver"
                  //onClick={() => onOpenMerchandiseModal(service, merch)}
                  >
                    <X size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
};

export const ComponentDate = ({ idControl, idService, itemService, sequencedetail, data, node, field, onUpdateServiceDetail, label, required }) => {
  const { t } = useLanguage();  
  return (
    <>
      <label className={styles.fieldLabel}>
          {required ? <span className={styles.required}>* </span> : ""} {label}
      </label>
      <input
        type="datetime-local"
        value={formatDateTimeLocal(data) || ""}
        className={styles.textInput}
        disabled = {false}
        required = {required}
        data-error-message={t('operations.dateRequired')}
        onChange={(e) =>
          onUpdateServiceDetail(idControl, idService, itemService, sequencedetail, node, field, e.target.value)
        }
      />
    </>
  )

};