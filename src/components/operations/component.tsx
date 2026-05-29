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

export const TipoUnidad = ({ itemService, sequencedetail, transport, onUpdateServiceDetail }) => {

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
        <option value={"Buque"}>Buque</option>
        {/* Ambos */}
        <option value={"Plataforma"}>Plataforma</option>
        {/* Articuladas */}
        <option value={"Caja seca 20"}>Caja seca 20</option>
        <option value={"Caja seca 40"}>Caja seca 40</option>
        <option value={"Caja seca 48"}>Caja seca 48</option>
        <option value={"Caja seca 53"}>Caja seca 53</option>
        <option value={"Remolque"}>Remolque</option>
        {/* No articuladas */}
        <option value={"Nissan"}>Nissan / Estaquitas</option>
        <option value={"Camión 3.5"}>Camión 3.5</option>
        <option value={"Rabón"}>Camión rabón</option>
        <option value={"Torton"}>Camión torton</option>
        <option value={"Torton"}>Camión mudancero</option>

        <option value={"PAX"}>PAX</option> {/* Carga mixta pasajeros y carga con restricciones */}
        <option value={"CAO"}>CAO</option> {/* Sólo carga (Cargo Aircraft ONLY) */}
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