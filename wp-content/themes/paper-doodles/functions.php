<?php
/**
 * Paper Doodles Theme Functions
 */

add_action( 'wp_enqueue_scripts', 'paper_doodles_scripts' );

function paper_doodles_scripts() {
	$theme_uri = get_template_directory_uri();

	// Google Fonts
	wp_enqueue_style(
		'paper-doodles-google-fonts',
		'https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Rajdhani:wght@300;500;700&display=swap',
		[],
		null
	);

	// Main styles
	wp_enqueue_style(
		'paper-doodles-style',
		$theme_uri . '/assets/style.css',
		[ 'paper-doodles-google-fonts' ],
		filemtime( get_template_directory() . '/assets/style.css' )
	);

	// Game script
	wp_enqueue_script(
		'paper-doodles-app',
		$theme_uri . '/assets/app.js',
		[],
		filemtime( get_template_directory() . '/assets/app.js' ),
		true
	);

	// Pass theme URL and ACF game settings to JS
	$page_id  = get_option( 'page_on_front' );
	$settings = get_field( 'game_settings', $page_id ) ?: [];

	$towers_data = [];
	for ( $i = 1; $i <= 3; $i++ ) {
		$t = get_field( "tower_{$i}", $page_id ) ?: [];
		$towers_data[ "tower{$i}" ] = [
			'cost'        => (int) ( $t['cost'] ?? 0 ),
			'upgradeCost' => (int) ( $t['upgrade_cost'] ?? 0 ),
			'cells'       => (int) ( $t['cells'] ?? $i ),
			'damageLvl1'  => (int) ( $t['damage_lvl_1'] ?? 0 ),
			'damageLvl2'  => (int) ( $t['damage_lvl_2'] ?? 0 ),
			'damageLvl3'  => (int) ( $t['damage_lvl_3'] ?? 0 ),
			'rangeLvl1'   => (int) ( $t['range_lvl_1'] ?? 0 ),
			'rangeLvl2'   => (int) ( $t['range_lvl_2'] ?? 0 ),
			'rangeLvl3'   => (int) ( $t['range_lvl_3'] ?? 0 ),
			'fireRateLvl1' => (int) ( $t['fire_rate_lvl_1'] ?? 0 ),
			'fireRateLvl2' => (int) ( $t['fire_rate_lvl_2'] ?? 0 ),
			'fireRateLvl3' => (int) ( $t['fire_rate_lvl_3'] ?? 0 ),
		];
	}

	wp_localize_script( 'paper-doodles-app', 'paperDoodles', [
		'assetsUrl'    => $theme_uri . '/assets',
		'maxWave'      => (int) ( $settings['max_wave'] ?? 100 ),
		'startGold'    => (int) ( $settings['start_gold'] ?? 600 ),
		'startLives'   => (int) ( $settings['start_lives'] ?? 15 ),
		'autoNextWave' => (int) ( $settings['auto_next_wave'] ?? 15000 ),
		'towers'       => $towers_data,
	] );
}

add_action( 'after_setup_theme', 'paper_doodles_setup' );

function paper_doodles_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
}

/**
 * Register ACF fields programmatically — shown on pages with "Home" template
 */
add_action( 'acf/include_fields', 'paper_doodles_acf_fields' );

function paper_doodles_acf_fields() {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	acf_add_local_field_group( [
		'key'      => 'group_game_settings',
		'title'    => 'Game Settings',
		'fields'   => [
			[
				'key'        => 'field_game_settings_group',
				'label'      => 'Основные настройки',
				'name'       => 'game_settings',
				'type'       => 'group',
				'layout'     => 'block',
				'sub_fields' => [
					[
						'key'           => 'field_max_wave',
						'label'         => 'Max Waves',
						'name'          => 'max_wave',
						'type'          => 'number',
						'default_value' => 100,
						'min'           => 1,
						'max'           => 1000,
						'instructions'  => 'Количество волн в игре',
						'wrapper'       => [ 'width' => '25' ],
					],
					[
						'key'           => 'field_start_gold',
						'label'         => 'Start Gold',
						'name'          => 'start_gold',
						'type'          => 'number',
						'default_value' => 600,
						'min'           => 0,
						'instructions'  => 'Стартовое золото игрока',
						'wrapper'       => [ 'width' => '25' ],
					],
					[
						'key'           => 'field_start_lives',
						'label'         => 'Start Lives',
						'name'          => 'start_lives',
						'type'          => 'number',
						'default_value' => 15,
						'min'           => 1,
						'instructions'  => 'Количество жизней игрока',
						'wrapper'       => [ 'width' => '25' ],
					],
					[
						'key'           => 'field_auto_next_wave',
						'label'         => 'Auto Next Wave (ms)',
						'name'          => 'auto_next_wave',
						'type'          => 'number',
						'default_value' => 15000,
						'min'           => 1000,
						'step'          => 1000,
						'instructions'  => 'Автозапуск волны (мс)',
						'wrapper'       => [ 'width' => '25' ],
					],
				],
			],
			paper_doodles_tower_group( 1, [
				'cost' => 80, 'upgrade_cost' => 100, 'cells' => 1,
				'damage'    => [ 20, 30, 40 ],
				'range'     => [ 70, 77, 84 ],
				'fire_rate' => [ 300, 270, 243 ],
			] ),
			paper_doodles_tower_group( 2, [
				'cost' => 150, 'upgrade_cost' => 170, 'cells' => 2,
				'damage'    => [ 25, 38, 50 ],
				'range'     => [ 84, 92, 101 ],
				'fire_rate' => [ 500, 450, 405 ],
			] ),
			paper_doodles_tower_group( 3, [
				'cost' => 250, 'upgrade_cost' => 300, 'cells' => 3,
				'damage'    => [ 30, 45, 60 ],
				'range'     => [ 101, 111, 121 ],
				'fire_rate' => [ 1000, 900, 810 ],
			] ),
			[
				'key'        => 'field_phrases_group',
				'label'      => 'Фразы',
				'name'       => 'phrases',
				'type'       => 'group',
				'layout'     => 'block',
				'sub_fields' => [
					[
						'key'           => 'field_phrase_pause',
						'label'         => 'Гоблин: пауза',
						'name'          => 'goblin_pause',
						'type'          => 'text',
						'default_value' => 'Стопэ!!!',
						'instructions'  => 'Фраза при паузе',
						'wrapper'       => [ 'width' => '20' ],
					],
					[
						'key'           => 'field_phrase_attack',
						'label'         => 'Гоблин: атака',
						'name'          => 'goblin_attack',
						'type'          => 'text',
						'default_value' => 'Мочи буржуев...!!!',
						'instructions'  => 'Фраза при атаке',
						'wrapper'       => [ 'width' => '20' ],
					],
					[
						'key'           => 'field_phrase_done',
						'label'         => 'Гоблин: конец волны',
						'name'          => 'goblin_done',
						'type'          => 'text',
						'default_value' => 'Ёб твою мать...',
						'instructions'  => 'Фраза после волны',
						'wrapper'       => [ 'width' => '20' ],
					],
					[
						'key'           => 'field_phrase_one',
						'label'         => 'Гоблин: один враг',
						'name'          => 'goblin_one',
						'type'          => 'text',
						'default_value' => 'Ха-ха, пёс!!!',
						'instructions'  => 'Фраза когда один враг прошел',
						'wrapper'       => [ 'width' => '20' ],
					],
					[
						'key'           => 'field_phrase_finally',
						'label'         => 'Гоблин: наконец-то',
						'name'          => 'goblin_finally',
						'type'          => 'text',
						'default_value' => 'Ебааа, наконец-то...',
						'instructions'  => 'Фраза при запуске волны после долгого ожидания',
						'wrapper'       => [ 'width' => '20' ],
					],
					[
						'key'           => 'field_phrases_knights_taunt',
						'label'         => 'Рыцари: между волнами',
						'name'          => 'knights_taunt',
						'type'          => 'textarea',
						'default_value' => "Ой, бля, он ещё и разговаривает!\nСлышь, пёс, я тебе рожу в жопу затолкаю!\nСлышь, хуй моржовый, рот закрой!\nДохуя пиздишь? Я те щас устрою!\nЕбать ты страшный. ))\nТы думал тут легко будет? Хертебе, а не замок!\nСлышь, плесень, я тебя сейчас на стену размажу!\nЯ те щас уши отрежу и в жопу затолкаю, понял?\nЯ тебе зубы пересчитаю и на калькуляторе распечатаю!\nЯ тебя разберу, как конструктор, и не соберу обратно!\nСлышь, синий, я тебя щас как жабу тапком вмажу!\nТвоя рожа кирпича просит, а я отзывчивый, могу устроить!",
						'instructions'  => 'Фразы рыцарей между волнами (по одной на строку)',
						'rows'          => 6,
						'new_lines'     => '',
						'wrapper'       => [ 'width' => '50' ],
					],
					[
						'key'           => 'field_phrases_goblin_taunt',
						'label'         => 'Гоблин: между волнами',
						'name'          => 'goblin_taunt',
						'type'          => 'textarea',
						'default_value' => "Я щас приду и тебе доспехи в жопу затолкаю!\nЯ тебя через хер да в красную армию!\nЯ тебя в узел завяжу и бантик сделаю!\nИди нахер, и маму свою забери!\nЯ тебя, блин, в фарш прокручу и пельмени слеплю!\nЧё сказал? А ну повтори, козёл!\nЯ тебя через колено и в макулатуру сдам!\nТы блин реально охуел. Ну, щас ты огребешь.\nТы кто вообще? Хуй с горы? Вали отсюда!\nЯ тебе сейчас меч в жопу вставлю и скажу, что это традиция!\nЯ тебя в болото утоплю и скажу, что ты декоративный!\nЯ тебя в костёр кину и скажу, что это фестиваль!",
						'instructions'  => 'Фразы гоблина между волнами (по одной на строку)',
						'rows'          => 6,
						'new_lines'     => '',
						'wrapper'       => [ 'width' => '50' ],
					],
					[
						'key'           => 'field_phrases_knights_wave',
						'label'         => 'Рыцари: после волны',
						'name'          => 'knights_wave',
						'type'          => 'textarea',
						'default_value' => "Йиппи-ка-ей, ушлёпок хренов!\nНу чё, зелёные, кто ещё хочет огрести?\nПиздуйте обратно в нору, крысы помойные!\nХуле встали? Валите нахрен!\nЕпать вас в сраку через коромысло!\nНу и хули ты мне сделаешь, плесень зелёная?\nПошли нахуй, шушера подзаборная!\nЯ вас тут всех в асфальт закатаю, долбодятлы!\nОй, бля, а чё так мало? Я только разогрелся!\nМелкие засланцы вы, замок стоит!\nКак ебали мы вас черти, так ебать и будем))",
						'instructions'  => 'Фразы рыцарей после завершения волны (по одной на строку)',
						'rows'          => 6,
						'new_lines'     => '',
						'wrapper'       => [ 'width' => '50' ],
					],
				],
			],
		],
		'location' => [
			[
				[
					'param'    => 'page_template',
					'operator' => '==',
					'value'    => 'page-home.php',
				],
			],
		],
	] );
}

/**
 * Helper: generate ACF group field for a tower
 */
function paper_doodles_tower_group( int $num, array $defaults ): array {
	$p = "tower_{$num}";

	return [
		'key'        => "field_{$p}_group",
		'label'      => "Башня {$num}",
		'name'       => $p,
		'type'       => 'group',
		'layout'     => 'block',
		'sub_fields' => [
			[
				'key'           => "field_{$p}_cost",
				'label'         => 'Стоимость',
				'name'          => 'cost',
				'type'          => 'number',
				'default_value' => $defaults['cost'],
				'min'           => 0,
				'wrapper'       => [ 'width' => '33' ],
			],
			[
				'key'           => "field_{$p}_upgrade_cost",
				'label'         => 'Стоимость улучшения',
				'name'          => 'upgrade_cost',
				'type'          => 'number',
				'default_value' => $defaults['upgrade_cost'],
				'min'           => 0,
				'wrapper'       => [ 'width' => '33' ],
			],
			[
				'key'           => "field_{$p}_cells",
				'label'         => 'Размер (клетки)',
				'name'          => 'cells',
				'type'          => 'number',
				'default_value' => $defaults['cells'],
				'min'           => 1,
				'max'           => 5,
				'wrapper'       => [ 'width' => '33' ],
			],
			[
				'key'           => "field_{$p}_damage_lvl_1",
				'label'         => 'Урон Lvl 1',
				'name'          => 'damage_lvl_1',
				'type'          => 'number',
				'default_value' => $defaults['damage'][0],
				'min'           => 0,
				'wrapper'       => [ 'width' => '33' ],
			],
			[
				'key'           => "field_{$p}_damage_lvl_2",
				'label'         => 'Урон Lvl 2',
				'name'          => 'damage_lvl_2',
				'type'          => 'number',
				'default_value' => $defaults['damage'][1],
				'min'           => 0,
				'wrapper'       => [ 'width' => '33' ],
			],
			[
				'key'           => "field_{$p}_damage_lvl_3",
				'label'         => 'Урон Lvl 3',
				'name'          => 'damage_lvl_3',
				'type'          => 'number',
				'default_value' => $defaults['damage'][2],
				'min'           => 0,
				'wrapper'       => [ 'width' => '33' ],
			],
			[
				'key'           => "field_{$p}_range_lvl_1",
				'label'         => 'Радиус Lvl 1',
				'name'          => 'range_lvl_1',
				'type'          => 'number',
				'default_value' => $defaults['range'][0],
				'min'           => 0,
				'wrapper'       => [ 'width' => '33' ],
			],
			[
				'key'           => "field_{$p}_range_lvl_2",
				'label'         => 'Радиус Lvl 2',
				'name'          => 'range_lvl_2',
				'type'          => 'number',
				'default_value' => $defaults['range'][1],
				'min'           => 0,
				'wrapper'       => [ 'width' => '33' ],
			],
			[
				'key'           => "field_{$p}_range_lvl_3",
				'label'         => 'Радиус Lvl 3',
				'name'          => 'range_lvl_3',
				'type'          => 'number',
				'default_value' => $defaults['range'][2],
				'min'           => 0,
				'wrapper'       => [ 'width' => '33' ],
			],
			[
				'key'           => "field_{$p}_fire_rate_lvl_1",
				'label'         => 'Скорострельность Lvl 1 (мс)',
				'name'          => 'fire_rate_lvl_1',
				'type'          => 'number',
				'default_value' => $defaults['fire_rate'][0],
				'min'           => 50,
				'wrapper'       => [ 'width' => '33' ],
			],
			[
				'key'           => "field_{$p}_fire_rate_lvl_2",
				'label'         => 'Скорострельность Lvl 2 (мс)',
				'name'          => 'fire_rate_lvl_2',
				'type'          => 'number',
				'default_value' => $defaults['fire_rate'][1],
				'min'           => 50,
				'wrapper'       => [ 'width' => '33' ],
			],
			[
				'key'           => "field_{$p}_fire_rate_lvl_3",
				'label'         => 'Скорострельность Lvl 3 (мс)',
				'name'          => 'fire_rate_lvl_3',
				'type'          => 'number',
				'default_value' => $defaults['fire_rate'][2],
				'min'           => 50,
				'wrapper'       => [ 'width' => '33' ],
			],
		],
	];
}
