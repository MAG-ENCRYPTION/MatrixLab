import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  Card,
  CardBody,
  Progress,
  Input,
} from "reactstrap";

const LEDMatrixApp = () => {
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [matrixConfig, setMatrixConfig] = useState([]);
  const [history, setHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [repetitions, setRepetitions] = useState(10);
  const [error, setError] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [currentDeleteIndex, setCurrentDeleteIndex] = useState(null);

  const MAX_SIZE = 5;

  const validateAndSetConfig = () => {
    if (rows > MAX_SIZE || cols > MAX_SIZE) {
      setError(`La taille maximale est ${MAX_SIZE}x${MAX_SIZE}.`);
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
    setError(null);
  };

  const toggleCell = (row, col, i, j) => {
    const newConfig = [...matrixConfig];
    newConfig[row][col][i][j] = !newConfig[row][col][i][j];
    setMatrixConfig(newConfig);
  };

  const generateBinary = (row, col) => {
    const matrix = matrixConfig[row][col];
    const columns = Array(8).fill("");
    for (let colIndex = 0; colIndex < 8; colIndex++) {
      let binaryString = "";
      for (let rowIndex = 7; rowIndex >= 0; rowIndex--) {
        binaryString += matrix[rowIndex][colIndex] ? "0" : "1";
      }
      columns[colIndex] = parseInt(binaryString, 2).toString(16).padStart(2, "0");
    }
    return Array(repetitions)
      .fill(columns)
      .flat();
  };

  const addToHistory = (row, col) => {
    const binarySequence = generateBinary(row, col);
    setHistory([
      ...history,
      {
        name: `m${row + 1}_${col + 1}`,
        binary: binarySequence,
      },
    ]);
  };

  const confirmDelete = (index) => {
    setCurrentDeleteIndex(index);
    setConfirmModal(true);
  };

  const deleteHistoryItem = () => {
    setHistory(history.filter((_, i) => i !== currentDeleteIndex));
    setConfirmModal(false);
  };

  const generateAllFiles = () => {
    setIsGenerating(true);
    let progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          downloadFiles();
          setProgress(0);
          setIsGenerating(false);
        }
        return prev + 10;
      });
    }, 300);
  };

  const downloadFiles = () => {
    history.forEach((item) => {
      const content = new Uint8Array(item.binary.map((hex) => parseInt(hex, 16)));
      const blob = new Blob([content], { type: "application/octet-stream" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${item.name}.bin`;
      link.click();
    });
    alert("Fichiers Binaires Téléchargés avec succès !");
  };

  return (
    <Container className="py-4">
      <h1>LED Matrix Designer</h1>
      {error && <div className="alert alert-danger">{error}</div>}
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
        <Col>
          <Input
            type="number"
            placeholder="Répétitions"
            value={repetitions}
            onChange={(e) => setRepetitions(parseInt(e.target.value) || 10)}
          />
        </Col>
      </Row>
      {matrixConfig.length > 0 && (
        <Row>
          {matrixConfig.map((row, rowIndex) =>
            row.map((matrix, colIndex) => (
              <Col key={`${rowIndex}-${colIndex}`} className="mb-4">
                <Card>
                  <CardBody>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(8, 30px)",
                        gap: "5px",
                      }}
                    >
                      {matrix.map((row, i) =>
                        row.map((cell, j) => (
                          <div
                            key={`${i}-${j}`}
                            style={{
                              width: "30px",
                              height: "30px",
                              backgroundColor: cell ? "#007bff" : "#e0e0e0",
                              border: "1px solid #000",
                              cursor: "pointer",
                            }}
                            onClick={() => toggleCell(rowIndex, colIndex, i, j)}
                          />
                        ))
                      )}
                    </div>
                    <Button
                      color="success"
                      className="mt-3"
                      onClick={() => addToHistory(rowIndex, colIndex)}
                    >
                      Add to History
                    </Button>
                  </CardBody>
                </Card>
              </Col>
            ))
          )}
        </Row>
      )}
      {history.length > 0 && (
        <Row>
          <Col>
            <h5>Historique des Séquences</h5>
            {history.map((item, index) => (
              <div key={index} className="d-flex align-items-center mb-2">
                <span className="mr-3">{item.name}</span>
                <Button color="danger" onClick={() => confirmDelete(index)}>
                  Annuler
                </Button>
              </div>
            ))}
          </Col>
        </Row>
      )}
      {history.length > 0 && (
        <Button color="primary" onClick={generateAllFiles}>
          Générer tous les fichiers
        </Button>
      )}
      {isGenerating && (
        <Modal isOpen={isGenerating}>
          <ModalBody>
            <h5>Génération en cours...</h5>
            <Progress value={progress} />
          </ModalBody>
        </Modal>
      )}
      <Modal isOpen={confirmModal}>
        <ModalBody>Confirmez-vous la suppression de cette séquence ?</ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={deleteHistoryItem}>
            Confirmer
          </Button>
          <Button color="secondary" onClick={() => setConfirmModal(false)}>
            Annuler
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default LEDMatrixApp;
