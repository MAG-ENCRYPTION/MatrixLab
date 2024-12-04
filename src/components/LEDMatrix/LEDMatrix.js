import React, { useState } from "react";
import { Container, Row, Col, Button, Input } from "reactstrap";

const LEDMatrixApp = () => {
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [matrixConfig, setMatrixConfig] = useState([]);
  const [history, setHistory] = useState([]);
  const [repeatCount, setRepeatCount] = useState(10);

  const MAX_SIZE = 5;

  // Initialisation de la grande matrice
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
    setHistory(
      Array(rows)
        .fill(0)
        .map(() =>
          Array(cols)
            .fill(0)
            .map(() => [])
        )
    );
  };

  // Toggle cellule dans une sous-matrice
  const toggleCell = (row, col, i, j) => {
    const newConfig = [...matrixConfig];
    newConfig[row][col][i][j] = !newConfig[row][col][i][j];
    setMatrixConfig(newConfig);
  };

  // Générer une séquence hexadécimale pour une sous-matrice
  const generateHexSequence = (matrix) => {
    const columns = Array(8).fill("");
    for (let colIndex = 0; colIndex < 8; colIndex++) {
      let binaryString = "";
      for (let rowIndex = 7; rowIndex >= 0; rowIndex--) {
        binaryString += matrix[rowIndex][colIndex] ? "0" : "1"; // Non-coloré = 1, coloré = 0
      }
      columns[colIndex] = binaryString;
    }
    return columns.map((binary) => parseInt(binary, 2).toString(16).padStart(2, "0"));
  };

  // Ajouter l'état actuel dans l'historique
  const addToHistory = () => {
    const newHistory = [...history];
    matrixConfig.forEach((row, rowIndex) =>
      row.forEach((matrix, colIndex) => {
        const hexSequence = generateHexSequence(matrix);
        const repeatedSequence = Array(repeatCount).fill(hexSequence).flat();
        newHistory[rowIndex][colIndex] = [
          ...newHistory[rowIndex][colIndex],
          ...repeatedSequence,
        ];
      })
    );
    setHistory(newHistory);
  };

  // Générer des fichiers binaires mis à jour
  const generateBinaryFiles = () => {
    history.forEach((row, rowIndex) =>
      row.forEach((hexData, colIndex) => {
        const binaryContent = new Uint8Array(hexData.map((hex) => parseInt(hex, 16)));
        const blob = new Blob([binaryContent], { type: "application/octet-stream" });
        const fileName = `m_${rowIndex + 1}${colIndex + 1}.bin`;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
      })
    );
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
            Add to History
          </Button>
        </Col>
        <Col>
          <Button color="success" onClick={generateBinaryFiles} disabled={!history.flat().length}>
            Generate Binary Files
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
          {history.map((row, rowIndex) => (
            <div
              key={rowIndex}
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols * 8}, 10px)`,
                gap: "0px",
              }}
            >
              {row.map((col) =>
                col.map((cell, index) => (
                  <div
                    key={index}
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: cell ? "#007bff" : "#e0e0e0",
                    }}
                  ></div>
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};

export default LEDMatrixApp;
