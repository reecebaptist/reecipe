import React from 'react';
import './App.css';
import Book from './components/Book';
import Cover from './pages/Cover';
import BackCover from './pages/BackCover';
import Foreword from './pages/Foreword';
import { recipeData } from './data';
import RecipePage, { RecipeDetailsPage } from './pages/RecipePage';
import BlankPage from './pages/BlankPage';
import ContentsPage from './pages/ContentsPage';

function App() {
  const contentsPageOffset = 5;
  return (
    <div className="App">
      <Book>
        <Cover />
        <BlankPage />
        <Foreword />
        <ContentsPage
          recipes={recipeData}
          pageNumber={1}
          pageOffset={contentsPageOffset}
        />
        <ContentsPage
          recipes={recipeData}
          pageNumber={2}
          pageOffset={contentsPageOffset}
        />
        {recipeData.flatMap((recipe, index) => [
          <RecipePage key={`img-${index}`} recipe={recipe} />,
          <RecipeDetailsPage key={`details-${index}`} recipe={recipe} />,
        ])}
        <BackCover />
      </Book>
    </div>
  );
}

export default App;
