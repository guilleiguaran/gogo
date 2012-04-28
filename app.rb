class App < Sinatra::Base
  set connections: {}, game: Nest.new("games")
  enable :sessions, :method_override


  # New Game form
  get "/games/new" do
    # Show new Game view
    erb "games/new"
  end

  # Create a new Game
  post "/games" do
    # Create a new game without moves
    id = settings.game[:id].incr

    # Join the current users as first player
    session[:player] = settings.game[id][:players].incr

    # Set a connections array for the game
    settings.connections[game.id] = []
  end

  # Show an existing game
  get "/games/:id" do
    # Find the requested game
    game = settings.game[params[:id]]

    # Get moves of the game
    moves = game[:moves].smembers

    # Set user as espectator if isn't a player
    session[:player] ||= 0

    # Set player type in player variable
    player = session[:player]

    # Show game view
    erb :"games/show", locals: { player: player, moves: moves.to_json }
  end

  # Join to an existing game
  get "/games/:id/join" do
    # Find the requested game
    id = params[:id]
    game = settings.game[id]

    # Join to the player in the game
    session[:player] = game[:players].incr

    # Limit to two players for game
    if session[:player] > 2
      # Mark as espectator
      session[:player] = 0

      # Decrease players count back to two
      game[:players].decr
    end

    # Redirect to Game
    redirect "/games/#{id}"
  end

  # Update an existing game (add a move)
  put "/games/:id" do
    # Find the game
    game = settings.game[params[:id]]

    # Get the move sent by user
    move = params[:move]

    # Save the move in the Game
    game[:moves].sadd(move)

    # Stream the move to the players
    settings.connections[params[:id]].each { |out| out << "data: #{move}\n\n" }
    204
  end

  # Accept streaming connections from users
  get "/games/:id/stream", provides: 'text/event-stream' do
    stream :keep_open do |out|
      # The requested game for stream
      id = params[:id]

      # Add user to connections list
      settings.connections[id] << out

      # Delete user on disconnect
      out.callback { settings.connections[id].delete(out) }
    end
  end
end
