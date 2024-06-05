import styles from '../styles/Grid.module.css';

const Grid = ({ data }) => {
  return (
    <div className={styles.tableContainer}>
      <table className="table is-fullwidth">
        <thead>
          <tr>
            <th>RPC URL</th>
            {data.length > 0 && data[0].responses.map((response, index) => (
              <th key={index}>{response.method}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((result, index) => (
            <tr key={index}>
              <td>{result.rpcUrl}</td>
              {result.responses.map((res, i) => (
                <td key={i}>
                  {res.error ? `❌ ${res.errorMessage}` : `${res.time.toFixed(2)} ms`}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Grid;


