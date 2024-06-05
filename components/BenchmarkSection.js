import { useState, useEffect } from 'react';
import Grid from './Grid';
import styles from '../styles/BenchmarkSection.module.css';

const BenchmarkSection = ({ title, rpcUrls, rpcMethods, fetchBenchmarkData }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const results = await fetchBenchmarkData(rpcUrls, rpcMethods);
      setData(results);
      setLoading(false);
    };
    fetchData();
  }, [rpcUrls, rpcMethods, fetchBenchmarkData]);

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      {loading ? (
        <div className={styles.loading}>
          <p>Loading benchmark data...</p>
          <p>This may take a few moments as we gather data from multiple RPC endpoints.</p>
        </div>
      ) : (
        <Grid data={data} />
      )}
    </div>
  );
};

export default BenchmarkSection;


