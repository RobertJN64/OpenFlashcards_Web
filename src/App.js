import React, { useState } from 'react';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

import './App.css';

const app_status = {
  WaitingOnStart: Symbol("WaitingOnStart"),
  AskMC: Symbol("AskMC"),
  AskOR: Symbol("AskOR"),
  End: Symbol("End"),
}

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


function MainCard() {
  const [current_status, set_current_status] = useState(app_status.WaitingOnStart);

  function e_start() {
    set_current_status(app_status.AskMC);
  }

  function render_start_screen() {
    return (
      <>
        <Card style={{ width: '50%', marginLeft: 'auto', marginRight: 'auto' }}>
          <Card.Body>

            <Card.Title>Load your cards...</Card.Title>
            <br />
            <Button style={{ width: '100%' }} className='btn-success' onClick={e_start}>Start</Button>
          </Card.Body>
        </Card >

      </>
    )
  }

  function ask_mc(term, cards, progress) {
    return (
      <>
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


  switch (current_status) {
    case app_status.WaitingOnStart:
      return render_start_screen();
    case app_status.AskMC:
      return ask_mc("Example Term", [], 17 / 39)
    default:
      alert("App status invalid! " + current_status)
      break;
  }
}

const App = () => (
  <>
    <h1 className="text-center">Open Flashcards Web</h1>
    <MainCard />


  </>
);

export default App;
