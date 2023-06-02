import React, { useState } from 'react';
import PropTypes from 'prop-types';
// import { useHistory } from 'react-router-dom';
import Router from 'next/router'
import { apiService } from '../utils/apiService';
import handleToastify from '../components/Toast';

const EventContext = React.createContext(null);
export { EventContext };

const EventContextContainer = (props) => {
  // let history = useHistory();
  const [eventDetail, setEventDetail] = useState({});
  const [eventTicketDetail, setEventTicketDetail] = useState({});
  const [eventList, setEventList] = useState([]);
  const [eventOrgList, setEventOrgList] = useState([]);
  const [eventListOrg, setEventListOrg] = useState([]);
  const [partyList, setPartyList] = useState([]);
  const [eventTicketPassList, setEventTicketPassList] = useState([]);
  const [curateEventList, setCurateEventList] = useState([]);
  const [isAccepInviteEvent, setAcceptInviteEvent] = useState(false);
  const [isSubmit, setSubmit] = useState(false);
  const [isRefund, setRefund] = useState(false);
  const [partyDetail, setPartyDetail] = useState({});
  const [eventAnalicsInfo, setEventAnalicesInfo] = useState({});
  const [eventBuyerList, setEventBuyerList] = useState([]);

  const getEventInviteDetail = (params) => {
    apiService()
      .post('event/getEventInviteDetail', params)
      .then((response) => {
        setEventDetail(response);
      })
      .catch((e) => {
        console.warn(e);
      });
  };

  const actionEvent = (params) => {
    apiService()
      .post('event/actionEvent', params)
      .then((response) => {
        setAcceptInviteEvent(true);
      })
      .catch((e) => {
        console.warn(e);
      });
  };

  const getEventList = () => {
    apiService()
      .get('event/getEventList')
      .then((response) => {
        setEventList(response);
      })
      .catch((e) => {
        console.warn(e);
      });
  };

  const submitEvent = (params) => {
    setSubmit(true);
    apiService()
      .post('event/submitEvent', params)
      .then((response) => {
        setSubmit(false);
        Router.push('/event-thankyou');
      })
      .catch((e) => {
        setSubmit(false);
        console.warn(e);
      });
  };

  const updateEvent = (params) => {
    apiService()
      .post('event/updateEvent', params)
      .then((response) => {
        setEventList(response);
      })
      .catch((e) => {
        console.warn(e);
      });
  };

  const getPartyList = () => {
    apiService()
      .get('party/getAllParties')
      .then((response) => {
        setPartyList(response);
      })
      .catch((e) => {
        console.warn(e);
      });
  };

  const getPartyDetailById = (params) => {
    apiService()
      .post('party/getPartyDetailById', params)
      .then((response) => {
        setPartyDetail(response);
      })
      .catch((e) => {
        console.warn(e);
      });
  };

  const getCurateEventList = () => {
    apiService()
      .get('curate/getAllEvents')
      .then((response) => {
        setCurateEventList(response);
      })
      .catch((e) => {
        console.warn(e);
      });
  };

  const updateCurateEvent = (params) => {
    apiService()
      .post('curate/submit', params)
      .then((response) => {
        setCurateEventList(response);
      })
      .catch((e) => {
        console.warn(e);
      });
  };

  const removeCurateEvent = (params) => {
    apiService()
      .post('curate/removeEvent', params)
      .then((response) => {
        setCurateEventList(response);
      })
      .catch((e) => {
        console.warn(e);
      });
  };

  const getEventDetail = (params) => {
    apiService()
      .post('event/eventTicketDetail', params)
      .then((response) => {
        setEventTicketDetail(response);
      })
      .catch((e) => {
        console.warn(e);
      });
  };

  const payWebEventTicket = (params) => {
    setSubmit(true);
    apiService()
      .post('event/payWebEventTicket', params)
      .then((response) => {
        setSubmit(false);
        Router.push('/eventthankyou');
      })
      .catch((e) => {
        setSubmit(false);
        console.warn(e);
      });
  };

  const getEventOrgList = () => {
    apiService()
      .get('event/getEventOrgList')
      .then((response) => {
        setEventOrgList(response);
      })
      .catch((e) => {
        console.warn(e);
      });
  };

  const getEventListByOrg = (params) => {
    apiService()
      .post('event/getEventListByOrg', params)
      .then((response) => {
        setEventListOrg(response);
      })
      .catch((e) => {
        console.warn(e);
      });
  };

  const getEventAnalicsInfo = (params) => {
    apiService()
      .post('event/getEventAnalicsInfo', params)
      .then((response) => {
        setEventAnalicesInfo(response);
      })
      .catch((e) => {
        console.warn(e);
      });
  };

  const getEventTicketPassByEventId = (params) => {
    apiService()
      .post('event/getEventTicketPassByEventId', params)
      .then((response) => {
        setEventTicketPassList(response);
      })
      .catch((e) => {
        console.warn(e);
      });
  };

  const sendTicketEmail = (params) => {
    apiService()
      .post('event/sendTicketEmail', params)
      .then((response) => {
        handleToastify('bg-info', 'Success!');
      })
      .catch((e) => {
        console.warn(e);
      });
  };

  const getBuyersByEvent = (params) => {
    apiService()
      .post('event/getBuyersByEvent', params)
      .then((response) => {
        setEventBuyerList(response);
      })
      .catch((e) => {
        console.warn(e);
      });
  };

  const refundAction = (params) => {
    apiService()
      .post('event/refundAction', params)
      .then((response) => {
        setRefund(true);
      })
      .catch((e) => {
        console.warn(e);
      });
  };

  return (
    <EventContext.Provider
      value={{
        isSubmit,
        isRefund,
        isAccepInviteEvent,
        eventDetail,
        eventList,
        curateEventList,
        partyList,
        partyDetail,
        eventTicketDetail,
        eventOrgList,
        eventListOrg,
        eventAnalicsInfo,
        eventTicketPassList,
        eventBuyerList,
        actionEvent,
        getEventInviteDetail,
        getEventList,
        submitEvent,
        updateEvent,
        getPartyList,
        getPartyDetailById,
        getCurateEventList,
        updateCurateEvent,
        removeCurateEvent,
        getEventDetail,
        payWebEventTicket,
        getEventOrgList,
        getEventListByOrg,
        getEventAnalicsInfo,
        getEventTicketPassByEventId,
        sendTicketEmail,
        getBuyersByEvent,
        refundAction,
      }}
    >
      {props.children}
    </EventContext.Provider>
  );
};

EventContextContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

export default EventContextContainer;
