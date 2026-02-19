<?php
/**
 * Template Name: Home
 */

get_header();

$phrases = get_field( 'phrases' ) ?: [];

$tower_defaults = [
	1 => [ 'cells' => 1, 'cost' => 80, 'upgrade_cost' => 100 ],
	2 => [ 'cells' => 2, 'cost' => 150, 'upgrade_cost' => 170 ],
	3 => [ 'cells' => 3, 'cost' => 250, 'upgrade_cost' => 300 ],
];
$tower = [];
for ( $i = 1; $i <= 3; $i++ ) {
	$t  = get_field( "tower_{$i}" ) ?: [];
	$df = $tower_defaults[ $i ];
	$tower[ $i ] = [
		'cells'        => (int) ( $t['cells'] ?? $df['cells'] ),
		'cost'         => (int) ( $t['cost'] ?? $df['cost'] ),
		'upgrade_cost' => (int) ( $t['upgrade_cost'] ?? $df['upgrade_cost'] ),
	];
}
?>

<!-- Paper Doodles title -->
<div class="paper-title">Paper Doodles</div>

<div class="game-container">
	<div class="main-area">

		<div class="stats-bar">
			<div class="stats-title">Tower Defense</div>
			<div class="stats-row">
				<div class="stat gold">
					<div>
						<div
							style="font-size: 26px;color: #0000ff;font-weight: 700;letter-spacing: 2px !important;">
							Gold
						</div>
						<div class="stat-value" id="gold">150</div>
					</div>
				</div>
				<div class="stat lives">
					<div>
						<div
							style="font-size: 26px;color: #0000ff;font-weight: 700;letter-spacing: 2px !important;">
							Life
						</div>
						<div class="stat-value" id="lives">5</div>
					</div>
				</div>
				<div class="stat wave">
					<div>
						<div
							style="font-size: 26px; color: #0000ff;font-weight: 700;letter-spacing: 2px !important;">
							Wave
						</div>
						<div class="stat-value" id="wave">1</div>
					</div>
				</div>
				<div class="stat score">
					<div>
						<div
							style="font-size: 26px;color: #0000ff;font-weight: 700;letter-spacing: 2px !important;">
							Score
						</div>
						<div class="stat-value" id="score">0</div>
					</div>
				</div>
			</div>
		</div>

		<div class="canvas-wrapper">
			<!-- Стопка страниц -->
			<div class="page-stack">
				<div class="page-edge"></div>
				<div class="page-edge-2"></div>
			</div>

			<canvas id="gameCanvas" width="600" height="700"></canvas>

			<!-- goblin overlay -->
			<div class="pause-overlay" id="pauseOverlay">
				<div class="pause-text"><?php echo esc_html( $phrases['goblin_pause'] ?? 'Стопэ!!!' ); ?></div>
			</div>
			<div class="pause-overlay" id="attackOverlay">
				<div class="pause-text"><?php echo esc_html( $phrases['goblin_attack'] ?? 'Мочи буржуев...!!!' ); ?></div>
			</div>
			<div class="pause-overlay" id="doneOverlay">
				<div class="pause-text"><?php echo esc_html( $phrases['goblin_done'] ?? 'Ёб твою мать...' ); ?></div>
			</div>
			<div class="pause-overlay" id="oneOverlay">
				<div class="pause-text"><?php echo esc_html( $phrases['goblin_one'] ?? 'Ха-ха, пёс!!!' ); ?></div>
			</div>
			<div class="pause-overlay" id="finallyOverlay">
				<div class="pause-text"><?php echo esc_html( $phrases['goblin_finally'] ?? 'Ебааа, наконец-то...' ); ?></div>
			</div>

			<!-- knights overlay -->
			<div class="pause-overlay pause-overlay-knights" id="knightsOverlay">
				<?php
				$knights_wave = $phrases['knights_wave'] ?? "Йиппи-ка-ей, ушлёпок хренов!\nНу чё, зелёные, кто ещё хочет огрести?\nПиздуйте обратно в нору, крысы помойные!\nХуле встали? Валите нахрен!\nЕпать вас в сраку через коромысло!\nНу и хули ты мне сделаешь, плесень зелёная?\nПошли нахуй, шушера подзаборная!\nЯ вас тут всех в асфальт закатаю, долбодятлы!\nОй, бля, а чё так мало? Я только разогрелся!\nМелкие засланцы вы, замок стоит!\nКак ебали мы вас черти, так ебать и будем))";
				foreach ( array_filter( explode( "\n", $knights_wave ) ) as $line ) : ?>
					<div class="pause-text"><?php echo esc_html( trim( $line ) ); ?></div>
				<?php endforeach; ?>
			</div>

			<!-- goblin text on pause -->
			<div class="pause-overlay" id="tempOverlay">
				<?php
				$goblin_taunt = $phrases['goblin_taunt'] ?? "Я щас приду и тебе доспехи в жопу затолкаю!\nЯ тебя через хер да в красную армию!\nЯ тебя в узел завяжу и бантик сделаю!\nИди нахер, и маму свою забери!\nЯ тебя, блин, в фарш прокручу и пельмени слеплю!\nЧё сказал? А ну повтори, козёл!\nЯ тебя через колено и в макулатуру сдам!\nТы блин реально охуел. Ну, щас ты огребешь.\nТы кто вообще? Хуй с горы? Вали отсюда!\nЯ тебе сейчас меч в жопу вставлю и скажу, что это традиция!\nЯ тебя в болото утоплю и скажу, что ты декоративный!\nЯ тебя в костёр кину и скажу, что это фестиваль!";
				foreach ( array_filter( explode( "\n", $goblin_taunt ) ) as $line ) : ?>
					<div class="pause-text"><?php echo esc_html( trim( $line ) ); ?></div>
				<?php endforeach; ?>
			</div>

			<!-- knights text on pause -->
			<div class="pause-overlay pause-overlay-knights" id="knightsTempOverlay">
				<?php
				$knights_taunt = $phrases['knights_taunt'] ?? "Ой, бля, он ещё и разговаривает!\nСлышь, пёс, я тебе рожу в жопу затолкаю!\nСлышь, хуй моржовый, рот закрой!\nДохуя пиздишь? Я те щас устрою!\nЕбать ты страшный. ))\nТы думал тут легко будет? Хертебе, а не замок!\nСлышь, плесень, я тебя сейчас на стену размажу!\nЯ те щас уши отрежу и в жопу затолкаю, понял?\nЯ тебе зубы пересчитаю и на калькуляторе распечатаю!\nЯ тебя разберу, как конструктор, и не соберу обратно!\nСлышь, синий, я тебя щас как жабу тапком вмажу!\nТвоя рожа кирпича просит, а я отзывчивый, могу устроить!";
				foreach ( array_filter( explode( "\n", $knights_taunt ) ) as $line ) : ?>
					<div class="pause-text"><?php echo esc_html( trim( $line ) ); ?></div>
				<?php endforeach; ?>
			</div>

		</div>

		<div class="instructions">
			Click map — place tower | Click tower — upgrade | 1-3 — select tower | Space — start wave | P — pause |
			S — sell
		</div>
	</div>

	<div class="side-panel">
		<div class="panel">
			<div class="panel-title">Towers</div>

			<?php for ( $i = 1; $i <= 3; $i++ ) :
				$cells = $tower[ $i ]['cells'];
				$canvas_width = $cells * 16 + 8;
				$selected = ( $i === 1 ) ? ' selected' : '';
			?>
			<div class="tower-btn-wrap">
				<button class="tower-btn tower<?php echo $i; ?><?php echo $selected; ?>" data-tower="tower<?php echo $i; ?>">
					<canvas class="tower-preview" data-cells="<?php echo $cells; ?>" width="<?php echo $canvas_width; ?>" height="24"></canvas>
					<div class="tower-stats">Buy: <?php echo $tower[ $i ]['cost']; ?></div>
					<div class="tower-cost">Upgrade: <?php echo $tower[ $i ]['upgrade_cost']; ?></div>
				</button>
			</div>
			<?php endfor; ?>
			<div class="control-btn-wrap">
				<button class="control-btn" id="playPauseBtn">Start</button>
			</div>
			<div class="control-btn-wrap">
				<button class="control-btn" id="nextWaveBtn" disabled>Next Wave</button>
			</div>
			<div class="control-btn-wrap">
				<button class="control-btn" id="sellBtn">Sell Mode</button>
			</div>
			<div class="control-btn-wrap">
				<button class="control-btn danger" id="restart">Restart</button>
			</div>
		</div>
	</div>
</div>

<div class="game-over-overlay" id="gameOver">
	<img src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/knights_fall.png' ); ?>" class="game-over-img" alt="Fallen knights">
	<div class="final-score" style="margin-top: -40px;">Final Score: <span id="finalScore">0</span></div>
	<button class="control-btn" onclick="location.reload()">Play Again</button>
</div>

<div class="victory-overlay" id="victoryScreen">
	<img src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/knights_victory.png' ); ?>" class="game-over-img" alt="Victory knights">
	<div class="final-score">Final Score: <span id="victoryScore">0</span></div>
	<button class="control-btn" onclick="location.reload()">Play Again</button>
</div>

<?php get_footer(); ?>