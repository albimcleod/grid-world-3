import { useState, useEffect } from 'react'
import '../styles/GameBoard.css'

const GRID_SIZE = 150
const WATER = 0
const LAND = 1
const BLOB = 2
const FOOD = 3
const VILLAGE_SIZE = 25
const EDGE_PADDING = 15

const SEASONS = {
  SUMMER: { name: 'Summer', foodPerCycle: 3 },
  AUTUMN: { name: 'Autumn', foodPerCycle: 2 },
  WINTER: { name: 'Winter', foodPerCycle: 1 },
  SPRING: { name: 'Spring', foodPerCycle: 4 }
};

const SEASON_DURATION = 25;

function GameBoard({ onStatsChange, initialBlobCount, initialFoodCount, isPaused, onLastBlob }) {
  const [grid, setGrid] = useState([])
  const [villages, setVillages] = useState([])
  const [blobs, setBlobs] = useState([])
  const [food, setFood] = useState([])
  const [cycles, setCycles] = useState(0)
  const [currentSeason, setCurrentSeason] = useState(SEASONS.SPRING)

  const VISION_RANGE = 10;

  // Generate initial island
  useEffect(() => {
    const newGrid = generateIsland()
    const newVillages = generateVillages()
    const newBlobs = generateBlobs(newGrid, newVillages)
    const newFood = generateFood(newGrid)
    
    setGrid(newGrid)
    setVillages(newVillages)
    setBlobs(newBlobs)
    setFood(newFood)
  }, [])

  // Move blobs every second
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      moveBlobs()
    }, 1000)

    return () => clearInterval(interval)
  }, [blobs, food, isPaused])

  // Update season based on cycle count
  useEffect(() => {
    const seasonIndex = Math.floor(cycles / SEASON_DURATION) % 4;
    const newSeason = [SEASONS.SPRING, SEASONS.SUMMER, SEASONS.AUTUMN, SEASONS.WINTER][seasonIndex];
    setCurrentSeason(newSeason);
  }, [cycles]);

  // Update stats whenever blobs or food change
  useEffect(() => {
    // Count blobs per village
    const villageCounts = blobs.reduce((counts, blob) => {
      counts[blob.homeVillageId] = (counts[blob.homeVillageId] || 0) + 1;
      return counts;
    }, {});

    onStatsChange({
      blobCount: blobs.length,
      foodCount: food.length,
      cycleCount: cycles,
      season: currentSeason.name,
      villageCounts: [
        villageCounts[0] || 0,
        villageCounts[1] || 0,
        villageCounts[2] || 0,
        villageCounts[3] || 0
      ]
    })
  }, [blobs, food, cycles, currentSeason])

  const generateIsland = () => {
    // Create empty grid
    let newGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(WATER))
    
    // Generate island using cellular automata
    for(let y = 10; y < GRID_SIZE-10; y++) {
      for(let x = 10; x < GRID_SIZE-10; x++) {
        if(Math.random() > 0.4) newGrid[y][x] = LAND
      }
    }

    // Smooth the island
    for(let i = 0; i < 5; i++) {
      newGrid = smoothIsland(newGrid)
    }

    return newGrid
  }

  const smoothIsland = (grid) => {
    const newGrid = grid.map(row => [...row])
    
    for(let y = 1; y < GRID_SIZE-1; y++) {
      for(let x = 1; x < GRID_SIZE-1; x++) {
        const neighbors = countLandNeighbors(grid, x, y)
        if(neighbors > 4) newGrid[y][x] = LAND
        if(neighbors < 4) newGrid[y][x] = WATER
      }
    }
    
    return newGrid
  }

  const countLandNeighbors = (grid, x, y) => {
    let count = 0
    for(let dy = -1; dy <= 1; dy++) {
      for(let dx = -1; dx <= 1; dx++) {
        if(grid[y+dy][x+dx] === LAND) count++
      }
    }
    return count
  }

  const generateBlobs = (grid, villages) => {
    const newBlobs = []
    while(newBlobs.length < initialBlobCount) {
      const homeVillage = villages[Math.floor(Math.random() * villages.length)];
      
      const x = Math.floor(Math.random() * (homeVillage.size - 2)) + homeVillage.x + 1;
      const y = Math.floor(Math.random() * (homeVillage.size - 2)) + homeVillage.y + 1;
      
      if(grid[y][x] === LAND) {
        newBlobs.push({ 
          x, 
          y, 
          id: Math.random(),
          lastAte: 0,
          lastReproduced: -25,
          homeVillageId: homeVillage.id,
          isCarryingFood: false,
          carryingCapacity: 1,
          age: 0
        })
      }
    }
    return newBlobs
  }

  const generateFood = (grid) => {
    const newFood = []
    while(newFood.length < initialFoodCount) {
      const x = Math.floor(Math.random() * GRID_SIZE)
      const y = Math.floor(Math.random() * GRID_SIZE)
      if(grid[y][x] === LAND && !food.some(f => f.x === x && f.y === y)) {
        newFood.push({ x, y, id: Math.random() })
      }
    }
    return newFood
  }

  const generateAdditionalFood = (grid, amount) => {
    const newFood = [];
    let attempts = 0;
    const maxAttempts = 1000;

    // If there's no existing food, spawn randomly
    if (food.length === 0) {
      while (newFood.length < amount && attempts < maxAttempts) {
        const x = Math.floor(Math.random() * GRID_SIZE);
        const y = Math.floor(Math.random() * GRID_SIZE);
        
        if (isValidFoodPosition(x, y, newFood)) {
          newFood.push({ x, y, id: Math.random() });
        }
        attempts++;
      }
    } else {
      // Spawn near existing food
      while (newFood.length < amount && attempts < maxAttempts) {
        // Pick a random existing food as reference point
        const referenceFood = food[Math.floor(Math.random() * food.length)];
        
        // Generate position within 10 steps of reference food
        const dx = Math.floor(Math.random() * 21) - 10; // -10 to +10
        const dy = Math.floor(Math.random() * 21) - 10;
        
        const x = Math.min(Math.max(referenceFood.x + dx, 0), GRID_SIZE - 1);
        const y = Math.min(Math.max(referenceFood.y + dy, 0), GRID_SIZE - 1);
        
        if (isValidFoodPosition(x, y, newFood)) {
          newFood.push({ x, y, id: Math.random() });
        }
        attempts++;
      }
    }
    
    return newFood;
  };

  // Helper function to check if a position is valid for new food
  const isValidFoodPosition = (x, y, newFood) => {
    return grid[y][x] === LAND && 
           !food.some(f => f.x === x && f.y === y) &&
           !newFood.some(f => f.x === x && f.y === y) &&
           !blobs.some(b => b.x === x && b.y === y);
  };

  const moveBlobs = () => {
    setCycles(prev => prev + 1)
    
    // First update hunger and remove starved blobs
    setBlobs(prevBlobs => {
      const remainingBlobs = prevBlobs.filter(blob => {
        const cyclesSinceEating = cycles - blob.lastAte;
        return cyclesSinceEating < 100;
      }).map(blob => ({
        ...blob,
        age: blob.age + 1
      }));

      if (remainingBlobs.length === 1) {
        onLastBlob();
      }

      return remainingBlobs;
    });

    // Add food every 2nd cycle based on current season
    if (cycles % 2 === 0) {
      const newFood = generateAdditionalFood(grid, currentSeason.foodPerCycle);
      setFood(prevFood => [...prevFood, ...newFood]);
    }

    // Check for reproduction
    checkReproduction();

    setBlobs(prevBlobs => {
      return prevBlobs.map(blob => {
        const hasEatenRecently = (cycles - blob.lastAte) < 25;
        const homeVillage = villages.find(v => v.id === blob.homeVillageId);
        const isInHomeVillage = isInVillage(blob, homeVillage);
        const isYoung = blob.age < 25;

        // If carrying food, head back to home village
        if (blob.isCarryingFood) {
          return moveTowardsPoint(blob, {
            x: homeVillage.x + Math.floor(homeVillage.size / 2),
            y: homeVillage.y + Math.floor(homeVillage.size / 2)
          });
        }
        
        // If well-fed and not young, return to village and wait
        if (hasEatenRecently && !isYoung) {
          if (isInHomeVillage) {
            // Stay in place if already in village
            return blob;
          } else {
            // Return to village
            return moveTowardsPoint(blob, {
              x: homeVillage.x + Math.floor(homeVillage.size / 2),
              y: homeVillage.y + Math.floor(homeVillage.size / 2)
            });
          }
        }
        
        // Look for nearby food
        const nearestFood = findNearestFood(blob);
        if (nearestFood) {
          return moveTowardsFood(blob, nearestFood);
        }
        
        // Young blobs should keep searching for food
        if (isYoung) {
          return randomMove(blob);
        }
        
        // If no food nearby, move towards center of island
        const islandCenter = {
          x: Math.floor(GRID_SIZE / 2),
          y: Math.floor(GRID_SIZE / 2)
        };
        
        // Only move towards center if blob is far from it
        const distanceToCenter = Math.abs(blob.x - islandCenter.x) + Math.abs(blob.y - islandCenter.y);
        if (distanceToCenter > 20) {
          return moveTowardsPoint(blob, islandCenter);
        }
        
        // If near center, move randomly
        return randomMove(blob);
      })
    })

    // Check for food consumption
    checkFoodConsumption()
  }

  const findNearestFood = (blob) => {
    let nearest = null;
    let shortestDistance = VISION_RANGE + 1;

    food.forEach(foodItem => {
      const distance = Math.abs(foodItem.x - blob.x) + Math.abs(foodItem.y - blob.y);
      if (distance <= VISION_RANGE && distance < shortestDistance) {
        // Check if there's a clear line of sight
        if (hasLineOfSight(blob, foodItem)) {
          nearest = foodItem;
          shortestDistance = distance;
        }
      }
    });

    return nearest;
  }

  const hasLineOfSight = (blob, food) => {
    // Using Bresenham's line algorithm to check all cells between blob and food
    let x1 = blob.x;
    let y1 = blob.y;
    const x2 = food.x;
    const y2 = food.y;
    
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;
    
    while (true) {
      // Skip checking the blob's position and food's position
      if (!(x1 === blob.x && y1 === blob.y) && !(x1 === food.x && y1 === food.y)) {
        // If we hit water, return false
        if (grid[y1][x1] === WATER) {
          return false;
        }
      }
      
      if (x1 === x2 && y1 === y2) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x1 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y1 += sy;
      }
    }
    
    return true;
  }

  const moveTowardsFood = (blob, food) => {
    const dx = Math.sign(food.x - blob.x);
    const dy = Math.sign(food.y - blob.y);
    
    // Try horizontal movement first
    if (dx !== 0) {
      const newX = blob.x + dx;
      if (isValidPosition(newX, blob.y)) {
        return { ...blob, x: newX };
      }
    }
    
    // Try vertical movement if horizontal not possible
    if (dy !== 0) {
      const newY = blob.y + dy;
      if (isValidPosition(blob.x, newY)) {
        return { ...blob, y: newY };
      }
    }
    
    // If can't move towards food, stay in place
    return blob;
  }

  const randomMove = (blob) => {
    const directions = [
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 }
    ];
    
    const dir = directions[Math.floor(Math.random() * directions.length)];
    const newX = blob.x + dir.dx;
    const newY = blob.y + dir.dy;
    
    if (isValidPosition(newX, newY) && !isCellOccupied(newX, newY)) {
      return { ...blob, x: newX, y: newY };
    }
    
    return blob;
  }

  const isValidPosition = (x, y) => {
    return x >= 0 && 
           x < GRID_SIZE && 
           y >= 0 && 
           y < GRID_SIZE && 
           grid[y][x] === LAND;
  }

  const checkFoodConsumption = () => {
    setFood(prevFood => {
      return prevFood.filter(foodItem => {
        // Check if any blob is eating this food
        const isEaten = blobs.some(blob => 
          blob.x === foodItem.x && blob.y === foodItem.y
        );
        
        if (isEaten) {
          // Update the blob that ate the food
          setBlobs(prevBlobs => {
            return prevBlobs.map(blob => {
              if (blob.x === foodItem.x && blob.y === foodItem.y) {
                return handleFoodEncounter(blob, foodItem);
              }
              return blob;
            });
          });
        }
        
        return !isEaten;
      })
    })
  }

  const handleFoodEncounter = (blob, foodItem) => {
    const cyclesSinceEating = cycles - blob.lastAte;
    const homeVillage = villages.find(v => v.id === blob.homeVillageId);
    const isYoung = blob.age < 25;
    
    // If in home village and carrying food, deposit it
    if (blob.isCarryingFood && isInVillage(blob, homeVillage)) {
      if (homeVillage.foodStorage < homeVillage.maxStorage) {
        setVillages(prevVillages => 
          prevVillages.map(v => 
            v.id === homeVillage.id 
              ? { ...v, foodStorage: v.foodStorage + 1 }
              : v
          )
        );
        return { ...blob, isCarryingFood: false };
      }
      return blob;
    }
    
    // If young or hungry, eat the food
    if (isYoung || cyclesSinceEating > 30) {
      return { ...blob, lastAte: cycles };
    } 
    // If not hungry and not carrying food, pick it up
    else if (!blob.isCarryingFood) {
      return { ...blob, isCarryingFood: true };
    }
    
    return blob;
  };

  const checkReproduction = () => {
    const newBabies = [];
    
    blobs.forEach(blob1 => {
      if (blob1.age < 25 || cycles - blob1.lastReproduced < 25) return;

      blobs.forEach(blob2 => {
        if (blob1.id === blob2.id) return;
        
        if (blob2.age < 25 || cycles - blob2.lastReproduced < 25) return;
        
        const blob1HasEaten = cycles - blob1.lastAte < 25;
        const blob2HasEaten = cycles - blob2.lastAte < 25;
        if (!blob1HasEaten || !blob2HasEaten) return;
        
        const isAdjacent = Math.abs(blob1.x - blob2.x) <= 1 && 
                          Math.abs(blob1.y - blob2.y) <= 1;
        
        if (isAdjacent) {
          const babyPosition = findNearbyPosition(blob1, blob2);
          if (babyPosition) {
            newBabies.push({
              x: babyPosition.x,
              y: babyPosition.y,
              id: Math.random(),
              lastAte: cycles,
              lastReproduced: cycles,
              homeVillageId: blob1.homeVillageId,
              isCarryingFood: false,
              carryingCapacity: 1,
              age: 0
            });

            setBlobs(prevBlobs => {
              return prevBlobs.map(blob => {
                if (blob.id === blob1.id || blob.id === blob2.id) {
                  return { ...blob, lastReproduced: cycles };
                }
                return blob;
              });
            });
          }
        }
      });
    });
    
    if (newBabies.length > 0) {
      setBlobs(prevBlobs => [...prevBlobs, ...newBabies]);
    }
  };

  const findNearbyPosition = (parent1, parent2) => {
    let attempts = 0;
    const maxAttempts = 50;
    
    // Use parent1's home village
    const homeVillage = villages.find(v => v.id === parent1.homeVillageId);
    
    while (attempts < maxAttempts) {
      // Generate position within the village boundaries
      const x = Math.floor(Math.random() * (homeVillage.size - 2)) + homeVillage.x + 1;
      const y = Math.floor(Math.random() * (homeVillage.size - 2)) + homeVillage.y + 1;
      
      // Check if position is valid
      if (isValidBlobPosition(x, y)) {
        return { x, y };
      }
      
      attempts++;
    }
    
    return null;
  };

  const isValidBlobPosition = (x, y) => {
    return grid[y][x] === LAND && 
           !blobs.some(b => b.x === x && b.y === y);
  };

  const generateVillages = () => {
    return [
      // Top-left village
      {
        id: 0,
        x: EDGE_PADDING,
        y: EDGE_PADDING,
        size: VILLAGE_SIZE,
        color: 'rose'
      },
      // Top-right village
      {
        id: 1,
        x: GRID_SIZE - EDGE_PADDING - VILLAGE_SIZE,
        y: EDGE_PADDING,
        size: VILLAGE_SIZE,
        color: 'darkblue'
      },
      // Bottom-left village
      {
        id: 2,
        x: EDGE_PADDING,
        y: GRID_SIZE - EDGE_PADDING - VILLAGE_SIZE,
        size: VILLAGE_SIZE,
        color: 'purple'
      },
      // Bottom-right village
      {
        id: 3,
        x: GRID_SIZE - EDGE_PADDING - VILLAGE_SIZE,
        y: GRID_SIZE - EDGE_PADDING - VILLAGE_SIZE,
        size: VILLAGE_SIZE,
        color: 'darkred'
      }
    ];
  };

  // Update moveTowardsPoint to include a small random chance of deviation
  const moveTowardsPoint = (blob, point) => {
    // 10% chance to move randomly instead of towards target
    if (Math.random() < 0.1) {
      return randomMove(blob);
    }

    const dx = Math.sign(point.x - blob.x);
    const dy = Math.sign(point.y - blob.y);
    
    // Try horizontal movement first
    if (dx !== 0) {
      const newX = blob.x + dx;
      if (isValidPosition(newX, blob.y) && !isCellOccupied(newX, blob.y)) {
        return { ...blob, x: newX };
      }
    }
    
    // Try vertical movement if horizontal not possible
    if (dy !== 0) {
      const newY = blob.y + dy;
      if (isValidPosition(blob.x, newY) && !isCellOccupied(blob.x, newY)) {
        return { ...blob, y: newY };
      }
    }
    
    // If can't move towards point, stay in place
    return blob;
  };

  const isInVillage = (blob, village) => {
    return blob.x >= village.x && 
           blob.x < village.x + village.size && 
           blob.y >= village.y && 
           blob.y < village.y + village.size;
  };

  const isCellOccupied = (x, y) => {
    return blobs.some(b => b.x === x && b.y === y);
  };

  return (
    <div className="game-board">
      {grid.map((row, y) => (
        <div key={y} className="row">
          {row.map((cell, x) => {
            const blob = blobs.find(b => b.x === x && b.y === y)
            const hasFood = food.some(f => f.x === x && f.y === y)
            const village = villages.find(village => (
              (x >= village.x && x < village.x + village.size && 
               (y === village.y || y === village.y + village.size - 1)) ||
              (y >= village.y && y < village.y + village.size && 
               (x === village.x || x === village.x + village.size - 1))
            ))
            const cellType = blob ? `blob-${blob.homeVillageId}` : 
                           hasFood ? 'food' :
                           village ? `village-border-${village.color}` :
                           cell === LAND ? 'land' : 'water'
            return (
              <div key={`${x}-${y}`} className={`cell ${cellType}`} />
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default GameBoard 