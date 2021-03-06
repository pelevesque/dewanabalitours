<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="description" content="Dewana Bali Tours offers tours and travel services throughout the beautiful island of Bali.">
    <title>Dewana Bali Tours &ndash; <?php echo $page ?></title>
    <link rel="stylesheet" href="assets/site.css">
    <link rel="stylesheet" type="text/css" href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css">
    <link href='http://fonts.googleapis.com/css?family=Ubuntu:300,400' rel='stylesheet' type='text/css'>
    <!--[if IE]><script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/html5shiv/r29/html5.min.js"></script><![endif]-->
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"></script>
    <script src="assets/site.js"></script>
  </head>
  <body>
    <header>
      <nav>
        <ul>
          <li<?php if ($page == 'About'): ?> class="active">About<?php else: ?>><a href="index.php">About</a><?php endif ?></li>
          <li<?php if ($page == 'Tours'): ?> class="active">Tours<?php else: ?>><a href="tours.php">Tours</a><?php endif ?></li>
          <li<?php if ($page == 'Vehicles'): ?> class="active">Vehicles<?php else: ?>><a href="vehicles.php">Vehicles</a><?php endif ?></li>
          <li<?php if ($page == 'Photos'): ?> class="active">Photos<?php else: ?>><a href="photos.php">Photos</a><?php endif ?></li>
        </ul>
      </nav>
      <div>
        <h1>Dewana Bali Tours</h1>
        <h2>Touring the beauty of Bali</h2>
      </div>
    </header>
    <div role="main">
