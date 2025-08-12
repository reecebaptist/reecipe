import React from 'react';
import './App.css';
import Book from './components/Book';
import Cover from './pages/Cover';
import BackCover from './pages/BackCover';
import Foreword from './pages/Foreword';
import { recipeData, type Recipe } from './data';
import RecipePage, { RecipeDetailsPage } from './pages/RecipePage';
import BlankPage from './pages/BlankPage';
import ContentsPage from './pages/ContentsPage';
import { listRecipes, seedRecipes } from './services/recipes';

function App() {
  const contentsPageOffset = 5;
  const [recipes, setRecipes] = React.useState<Recipe[]>(recipeData);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const dbRecipes = await listRecipes();
        if (!mounted) return;
        if (dbRecipes.length === 0) {
          // Seed once if table is empty
          await seedRecipes(recipeData);
          const seeded = await listRecipes();
          if (!mounted) return;
          setRecipes(seeded.length ? seeded : recipeData);
        } else {
          setRecipes(dbRecipes);          
        }
      } catch (err: any) {        
        // If Supabase not configured or any error, fall back to local data
        setRecipes(recipeData);
        // Optionally log in dev
        // console.warn('Using local recipe data. Reason:', err?.message || err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="App">Loading recipes…</div>;
  }

  return (
    <div className="App">
      <Book>
        <Cover />
        <BlankPage />
        <Foreword />
        <ContentsPage
          recipes={recipes}
          pageNumber={1}
          pageOffset={contentsPageOffset}
        />
        <ContentsPage
          recipes={recipes}
          pageNumber={2}
          pageOffset={contentsPageOffset}
        />
        {recipes.flatMap((recipe, index) => {
          const pageNum = contentsPageOffset + index * 2 + 1;
          return [
            <RecipePage key={`img-${index}`} recipe={recipe} />,
            <RecipeDetailsPage
              key={`details-${index}`}
              recipe={recipe}
              pageNumber={pageNum}
            />,
          ];
        })}
        <BackCover />
      </Book>
    </div>
  );
}

export default App;
