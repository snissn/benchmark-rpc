import styles from '../styles/Grid.module.css';

const Grid = ({ data }) => {
  const getColorClass = (time) => {
    if (time > 500) {
      return 'has-background-danger has-text-light';
    } else if (time > 200) {
      return 'has-background-warning has-text-dark';
    } else {
      return '';
    }
  };

  const calculateAverage = (methodIndex) => {
    const times = data.map(result => result.responses[methodIndex].time).filter(time => !isNaN(time));
    const total = times.reduce((acc, time) => acc + time, 0);
    return (total / times.length).toFixed(2);
  };

  const calculateMedian = (methodIndex) => {
    const times = data.map(result => result.responses[methodIndex].time).filter(time => !isNaN(time)).sort((a, b) => a - b);
    const mid = Math.floor(times.length / 2);
    return times.length % 2 !== 0 ? times[mid].toFixed(2) : ((times[mid - 1] + times[mid]) / 2).toFixed(2);
  };

  return (
    <div className={styles.tableContainer}>
      <table className="table is-fullwidth">
        <thead>
          <tr>
            <th>Method</th>
            {data.map((result, index) => (
              <th key={index}>{result.rpcUrl}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 && data[0].responses.map((response, index) => (
            <tr key={index}>
              <td>{response.method}</td>
              {data.map((result, i) => (
                <td key={i} className={getColorClass(result.responses[index].time)}>
                  {result.responses[index].error ? `❌ ${result.responses[index].errorMessage}` : `${result.responses[index].time.toFixed(2)} ms`}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td>Average</td>
            {data.length > 0 && data[0].responses.map((_, index) => (
              <td key={index}>{calculateAverage(index)} ms</td>
            ))}
          </tr>
          <tr>
            <td>Median</td>
            {data.length > 0 && data[0].responses.map((_, index) => (
              <td key={index}>{calculateMedian(index)} ms</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Grid;


