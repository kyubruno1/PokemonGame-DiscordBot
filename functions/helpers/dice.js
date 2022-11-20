function dice(value) {
  //Dado padrão, retorna um valor aleatório +1 dentro do estabelecido no argumento da função
  return (Math.floor(Math.random() * value) + 1).toString();
}

module.exports = { dice, pokemonLevelDice, isShinyDice };
