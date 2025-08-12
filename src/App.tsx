import React from 'react';
import './App.css';
import Book from './components/Book';
import Cover from './pages/Cover';
import Page from './pages/Page';
import BackCover from './pages/BackCover';
import Foreword from './pages/Foreword';
import { pageData } from './data';

function App() {
  return (
    <div className="App">
      <Book>
        <Cover />
        <Foreword />
        {pageData.map((data, index) => (
          <Page
            key={index}
            title={data.title}
            content={data.content}
            pageNumber={index + 1}
          />
        ))}
        <BackCover />
      </Book>
    </div>
  );
}

export default App;
