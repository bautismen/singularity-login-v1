import styles from '../../pages/Operations.module.css';

export const TipoEnvio = ({ itemService, sequencedetail, detail, onUpdateServiceFormData }) => {

  return (
    <label className={styles.fieldLabel}>
      Tipo de envío / Shipping type
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
    </label>
  );
};

export const TipoReferencia = ({ itemService, sequencedetail, detail, onUpdateServiceFormData }) => {

  return (
    <label className={styles.fieldLabel}>
      Tipo de referencia envio
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
    </label>
  );
};

export const TipoOperacion = ({ itemService, sequencedetail, detail, onUpdateServiceFormData }) => {

  return (
    <label className={styles.fieldLabel}>
      Tipo operación / Operation type
      <select
        value={detail.idTypeOperation || ''}
        className={styles.selectInput}
        // readOnly
        required
        onChange={(e) => {
          onUpdateServiceFormData(itemService, sequencedetail, 'idTypeOperation', Number(e.target.value))
          onUpdateServiceFormData(itemService, sequencedetail, 'typeOperation', e.target.options[e.target.selectedIndex].text)
        }
        }
      >
        <option value="">Seleccionar ...</option>
        <option value={1}>Importación</option>
        <option value={2}>Exportación</option>
        <option value={3}>Nacional</option>
        <option value={4}>Local USA</option>
        <option value={5}>Triangulacion</option>
      </select>
    </label>
  );
};

export const Incoterm = ({ itemService, sequencedetail, detail, onUpdateServiceFormData, incoterms }) => {

  return (
    <label className={styles.fieldLabel}>
      Incoterm
      <select
        value={detail.idIncoterm}
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
    </label>
  );
};
  
export const Transportista = ({ itemService, sequencedetail, detail, onUpdateServiceFormData, transportista }) => {

  return (
    <label className={styles.fieldLabel}>
      Transportista *
      <select
        value={detail.transports.idTransport || ''}
        className={styles.selectInput}
        // readOnly
        // required
        onChange={(e) => {
          onUpdateServiceFormData(itemService, sequencedetail, 'idTransport', e.target.value)
          onUpdateServiceFormData(itemService, sequencedetail, 'nameTransport', e.target.options[e.target.selectedIndex].text)
        }
        }
      >
        <option value="">Seleccionar ...</option>
        {transportista.map((tr) => (
          <option key={tr.id} value={tr.id}>{tr.fiscalData.businessName}</option>
        ))}
      </select>
    </label>
  );
};
