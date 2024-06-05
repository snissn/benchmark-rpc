import { useState, useEffect } from 'react';
import Grid from './Grid';
import styles from '../styles/BenchmarkSection.module.css';

const BenchmarkSection = ({ title, rpcUrls, rpcMethods, fetchBenchmarkData }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const results = await fetchBenchmarkData(rpcUrls, rpcMethods);
      setData(results);
    };
    fetchData();
  }, [rpcUrls, rpcMethods, fetchBenchmarkData]);

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <Grid data={data} />
    </div>
  );
};

export default BenchmarkSection;

