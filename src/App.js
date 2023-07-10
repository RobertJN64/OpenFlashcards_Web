import React, { useState } from 'react';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';


import './App.css';

function e_btn(x) {
  alert("Button clicked: " + x);
}

window.addEventListener(
  "keydown",
  (event) => {
    if (['1', '2', '3', '4'].includes(event.key)) {
      e_btn(event.key);
    }
  },
  true,
);

function e_btn_1() { e_btn(1) };
function e_btn_2() { e_btn(2) };
function e_btn_3() { e_btn(3) };
function e_btn_4() { e_btn(4) };

function ask_mc(term, cards, progress) {
  return (
    <>

      <h1 className="text-center">Open Flashcards Web</h1>

      <Card style={{ width: '50%', marginLeft: 'auto', marginRight: 'auto' }}>
        <Card.Body>
          <p style={{ textAlign: 'right' }}>{progress.toFixed(4) * 100}%</p>
          <Card.Title>{term}</Card.Title>
          <br />
          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <td><Button style={{ width: '100%' }} onClick={e_btn_1}>Item 1</Button></td>
                <td></td>
                <td><Button style={{ width: '100%' }} onClick={e_btn_2}>Item 2</Button></td>
              </tr>
              <tr><td><p></p></td></tr>
              <tr>
                <td><Button style={{ width: '100%' }} onClick={e_btn_3}>Item 3</Button></td>
                <td></td>
                <td><Button style={{ width: '100%' }} onClick={e_btn_4}>Item 4</Button></td>
              </tr>
            </tbody>
          </table>
        </Card.Body>
      </Card>

    </>
  )
}

const App = () => (
  ask_mc("Example Term", [], 17 / 39)
);

export default App;
