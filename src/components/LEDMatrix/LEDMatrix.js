import React, { useState } from "react";
import { Container, Row, Col, Button, Input } from "reactstrap";

const LEDMatrixApp = () => {
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [matrixConfig, setMatrixConfig] = useState([]);
  const [history, setHistory] = useState([]);
  const [repeatCount, setRepeatCount] = useState(1);

  const MAX_SIZE = 5;

  const validateAndSetConfig = () => {
    if (rows > MAX_SIZE || cols > MAX_SIZE) {
      alert(`La taille maximale est ${MAX_SIZE}x${MAX_SIZE}.`);
      return;
    }
    const newConfig = Array(rows)
      .fill(0)
      .map(() =>
        Array(cols)
          .fill(0)
          .map(() =>
            Array(8)
              .fill(0)
              .map(() => Array(8).fill(false))
          )
      );
    setMatrixConfig(newConfig);
    setHistory([]);
  };

  const toggleCell = (row, col, i, j) => {
    const newConfig = [...matrixConfig];
    newConfig[row][col][i][j] = !newConfig[row][col][i][j];
    setMatrixConfig(newConfig);
  };

  const generateHexSequence = (matrix) => {
    const columns = Array(8).fill("");
    for (let colIndex = 0; colIndex < 8; colIndex++) {
      let binaryString = "";
      for (let rowIndex = 7; rowIndex >= 0; rowIndex--) {
        binaryString += matrix[rowIndex][colIndex] ? "0" : "1";
      }
      columns[colIndex] = binaryString;
    }
    return columns.map((binary) => parseInt(binary, 2).toString(16).padStart(2, "0"));
  };

  const addToHistory = () => {
    const snapshot = matrixConfig.map((row) =>
      row.map((matrix) =>
        matrix.map((matrixRow) => [...matrixRow])
      )
    );
    setHistory([...history, snapshot]);
  };

  const removeLastHistory = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      newHistory.pop();
      setHistory(newHistory);
    }
  };

  const clearMatrix = () => {
    const clearedMatrix = matrixConfig.map((row) =>
      row.map((matrix) =>
        matrix.map((matrixRow) => matrixRow.map(() => false))
      )
    );
    setMatrixConfig(clearedMatrix);
  };

  const generateBinaryFiles = async () => {
    if (!window.showDirectoryPicker) {
      alert("Votre navigateur ne supporte pas la File System Access API.");
      return;
    }

    try {
      const directoryHandle = await window.showDirectoryPicker();
      matrixConfig.forEach(async (row, rowIndex) => {
        row.forEach(async (matrix, colIndex) => {
          const hexSequence = generateHexSequence(matrix);
          const repeatedSequence = Array(repeatCount).fill(hexSequence).flat();
          const binaryContent = new Uint8Array(
            repeatedSequence.map((hex) => parseInt(hex, 16))
          );
          const fileName = `m_${rowIndex + 1}${colIndex + 1}.bin`;

          const fileHandle = await directoryHandle.getFileHandle(fileName, {
            create: true,
          });
          const writable = await fileHandle.createWritable();
          await writable.write(binaryContent);
          await writable.close();
        });
      });

      alert("Fichiers binaires générés avec succès !");
    } catch (error) {
      console.error("Erreur lors de la génération des fichiers : ", error);
      alert("Erreur lors de la génération des fichiers. Veuillez réessayer.");
    }
  };

  return (
    <Container className="py-4">
      <h1>LED Matrix Designer</h1>
      <Row className="mb-3">
        <Col>
          <Input
            type="number"
            placeholder="N° de lignes"
            onChange={(e) => setRows(parseInt(e.target.value) || 0)}
          />
        </Col>
        <Col>
          <Input
            type="number"
            placeholder="N° de colonnes"
            onChange={(e) => setCols(parseInt(e.target.value) || 0)}
          />
        </Col>
        <Col>
          <Button color="primary" onClick={validateAndSetConfig}>
            Générer Matrice
          </Button>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <Input
            type="number"
            placeholder="Nombre de répétitions"
            value={repeatCount}
            onChange={(e) => setRepeatCount(parseInt(e.target.value) || 1)}
          />
        </Col>
        <Col>
          <Button color="info" onClick={addToHistory} disabled={!matrixConfig.length}>
            Ajouter à l'Historique
          </Button>
        </Col>
        <Col>
          <Button color="warning" onClick={removeLastHistory} disabled={!history.length}>
            Précédent
          </Button>
        </Col>
        <Col>
          <Button color="danger" onClick={clearMatrix} disabled={!matrixConfig.length}>
            Effacer
          </Button>
        </Col>
        <Col>
          <Button
            color="success"
            onClick={generateBinaryFiles}
            disabled={!matrixConfig.length}
          >
            Générer Binaires
          </Button>
        </Col>
      </Row>

      {matrixConfig.length > 0 && (
        <div>
          {matrixConfig.map((row, rowIndex) => (
            <div key={rowIndex} style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
              {row.map((matrix, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(8, 20px)",
                    gap: "2px",
                    backgroundColor: "#f8f9fa",
                    padding: "3px",
                    borderRadius: "5px",
                  }}
                >
                  {matrix.map((matrixRow, i) =>
                    matrixRow.map((cell, j) => (
                      <div
                        key={`${i}-${j}`}
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          backgroundColor: cell ? "#007bff" : "#e0e0e0",
                          cursor: "pointer",
                        }}
                        onClick={() => toggleCell(rowIndex, colIndex, i, j)}
                      />
                    ))
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-4">
          <h4>Historique des états</h4>
          {history.map((snapshot, snapshotIndex) => (
            <div key={snapshotIndex} style={{ marginBottom: "20px" }}>
              <h5>État {snapshotIndex + 1}</h5>
              <div>
                {snapshot.map((row, rowIndex) => (
                  <div key={rowIndex} style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                    {row.map((matrix, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(8, 10px)",
                          gap: "1px",
                          backgroundColor: "#f8f9fa",
                          padding: "3px",
                          borderRadius: "5px",
                        }}
                      >
                        {matrix.map((matrixRow, i) =>
                          matrixRow.map((cell, j) => (
                            <div
                              key={`${i}-${j}`}
                              style={{
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                backgroundColor: cell ? "#007bff" : "#e0e0e0",
                              }}
                            />
                          ))
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};

export default LEDMatrixApp;
