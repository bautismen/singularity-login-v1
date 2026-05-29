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
        }
        }
      >
        <option value="">Seleccionar ...</option>
        {transportista.map((tr) => (
          <option key={tr.id} value={tr.id}>{tr.fiscalData.businessName}</option>
        ))}
      </select>
    </>
  );
};

export const TipoUnidad = ({ itemService, sequencedetail, transport, onUpdateServiceDetail, modalidad }) => {

  const tipoUnidad =  [
    {value: "Buque", name: "Buque", modalidad: "maritimo"},
    {value: "Plataforma", name: "Plataforma", modalidad: "terrestre"},
    {value: "Caja seca 20", name: "Caja seca 20", modalidad: "terrestre"},
    {value: "Caja seca 40", name: "Caja seca 40", modalidad: "terrestre"},
    {value: "Caja seca 48", name: "Caja seca 48", modalidad: "terrestre"},
    {value: "Caja seca 53", name: "Caja seca 53", modalidad: "terrestre"},
    {value: "Remolque", name: "Remolque", modalidad: "terrestre"},
    {value: "Nissan", name: "Nissan", modalidad: "terrestre"},
    {value: "Rabón", name: "Rabón", modalidad: "terrestre"},
    {value: "Torton", name: "Torton", modalidad: "terrestre"},
    {value: "PAX", name: "PAX", modalidad: "aereo"}, /* Carga mixta pasajeros y carga con restricciones */
    {value: "CAO", name: "CAO", modalidad: "aereo"} /* Sólo carga (Cargo Aircraft ONLY) */
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
        {tipoUnidad.filter( tu => tu.modalidad === modalidad).map((tu) => (
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