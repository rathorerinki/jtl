import React, { useState } from "react";

const ShowMoreLess = ({about}) => {
  const [showMore, setShowMore] = useState(false)

  return (
    <>
  
    {about && about.length > 250 ? (
      <>

    <div className={` transition duration-300 dark:text-white !important paragraph ${showMore != '' ? `` : `line-clamp-2`}`} >
     <p className="myTestClass dark:text-white !important`" dangerouslySetInnerHTML={{ __html:about }} />     
    </div>
    <p className='btn text-[#753FF6] cursor-pointer font-semibold' onClick={() => setShowMore(!showMore)}>
      {showMore ? '  Show Less' : '  Show more'}
    </p> 

      </>

    )
    :
    <div className={`transition duration-300 paragraph ${showMore != '' ? `` : ``} dark:text-white !important` } >
     <p dangerouslySetInnerHTML={{ __html:about }} className="myTestClass"/>     
    </div>
    }
    </>

  );
};

export default ShowMoreLess;