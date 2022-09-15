import {useCallback , useEffect, useState} from "react";
import {getPrismicisedRails} from "services/prismicApiClient";


export const usePrismicRails = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async function () {
      try {
        setLoading(true);
        const response = await getPrismicisedRails();
        // setData(response)
        console.log(JSON.stringify(response?.results));
      } catch (err) {
        // setError(err)
        console.log(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

    // return(
    //     {loading && <div>Loading...</div>}
    // {data && <div>{data}</div>
    // )

}
