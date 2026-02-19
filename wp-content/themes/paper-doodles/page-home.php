<?php
/**
 * Template Name: Home
 */

get_header();

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
				<div class="pause-text">Стопэ!!!</div>
			</div>
			<div class="pause-overlay" id="attackOverlay">
				<div class="pause-text">Мочи буржуев...!!!</div>
			</div>
			<div class="pause-overlay" id="doneOverlay">
				<div class="pause-text">Ёб твою мать...</div>
			</div>
			<div class="pause-overlay" id="oneOverlay">
				<div class="pause-text">Ха-ха, пёс!!!</div>
			</div>
			<div class="pause-overlay" id="finallyOverlay">
				<div class="pause-text">Ебааа, наконец-то...</div>
			</div>

			<!-- knights overlay -->
			<div class="pause-overlay pause-overlay-knights" id="knightsOverlay">
				<div class="pause-text">Йиппи-ка-ей, ушлёпок хренов!</div>
				<div class="pause-text">Ну чё, зелёные, кто ещё хочет огрести?</div>
				<div class="pause-text">Пиздуйте обратно в нору, крысы помойные!</div>
				<div class="pause-text">Хуле встали? Валите нахрен!</div>
				<div class="pause-text">Епать вас в сраку через коромысло!</div>
				<div class="pause-text">Ну и хули ты мне сделаешь, плесень зелёная?</div>
				<div class="pause-text">Пошли нахуй, шушера подзаборная!</div>
				<div class="pause-text">Я вас тут всех в асфальт закатаю, долбодятлы!</div>
				<div class="pause-text">Ой, бля, а чё так мало? Я только разогрелся!</div>
				<div class="pause-text">Мелкие засланцы вы, замок стоит!</div>
				<div class="pause-text">Как ебали мы вас черти, так ебать и будем))</div>
			</div>

			<!-- goblin text on pause -->
			<div class="pause-overlay" id="tempOverlay">
				<div class="pause-text">Я щас приду и тебе доспехи в жопу затолкаю!</div>
				<div class="pause-text">Я тебя через хер да в красную армию!</div>
				<div class="pause-text">Я тебя в узел завяжу и бантик сделаю!</div>
				<div class="pause-text">Иди нахер, и маму свою забери!</div>
				<div class="pause-text">Я тебя, блин, в фарш прокручу и пельмени слеплю!</div>
				<div class="pause-text">Чё сказал? А ну повтори, козёл!</div>
				<div class="pause-text">Я тебя через колено и в макулатуру сдам!</div>
				<div class="pause-text">Ты блин реально охуел. Ну, щас ты огребешь.</div>
				<div class="pause-text">Ты кто вообще? Хуй с горы? Вали отсюда!</div>
				<div class="pause-text">Я тебе сейчас меч в жопу вставлю и скажу, что это традиция!</div>
				<div class="pause-text">Я тебя в болото утоплю и скажу, что ты декоративный!</div>
				<div class="pause-text">Я тебя в костёр кину и скажу, что это фестиваль!</div>
			</div>

			<!-- knights text on pause -->
			<div class="pause-overlay pause-overlay-knights" id="knightsTempOverlay">
				<div class="pause-text">Ой, бля, он ещё и разговаривает!</div>
				<div class="pause-text">Слышь, пёс, я тебе рожу в жопу затолкаю!</div>
				<div class="pause-text">Слышь, хуй моржовый, рот закрой!</div>
				<div class="pause-text">Дохуя пиздишь? Я те щас устрою!</div>
				<div class="pause-text">Ебать ты страшный. ))</div>
				<div class="pause-text">Ты думал тут легко будет? Хертебе, а не замок!</div>
				<div class="pause-text">Слышь, плесень, я тебя сейчас на стену размажу!</div>
				<div class="pause-text">Я те щас уши отрежу и в жопу затолкаю, понял?</div>
				<div class="pause-text">Я тебе зубы пересчитаю и на калькуляторе распечатаю!</div>
				<div class="pause-text">Я тебя разберу, как конструктор, и не соберу обратно!</div>
				<div class="pause-text">Слышь, синий, я тебя щас как жабу тапком вмажу!</div>
				<div class="pause-text">Твоя рожа кирпича просит, а я отзывчивый, могу устроить!</div>
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