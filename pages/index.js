import { useEffect, useState } from 'react'

export default function Home({ users }) {
const[reactData, setReactData] = useState([]);
  return (
    <div>
      Test......
    </div>
  )
}
// export async function getServerSideProps({params,req,res,query,preview,previewData,resolvedUrl,locale,locales,defaultLocale}) {
//   console.log('Logging : '+res);
//   const data = await fetch('https://jsonplaceholder.typicode.com/users');
//   const users = await data.json();
//   return { props: { users } }
// }