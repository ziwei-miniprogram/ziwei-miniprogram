<?php

namespace Database\Seeders;

use App\Models\AuditEntry;
use App\Models\MeritTxn;
use App\Models\ReviewItem;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * 初始化种子：三角色账号 + 审核样本（含高危违规件）+ 功德流水（含异常暴涨）。
 * 用于本地验收后台三件套（审核台 / 功德账本 / 审计）。
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $super = User::create([
            'name' => '星野超管',
            'email' => 'admin@ziwei.app',
            'password' => bcrypt('ziwei2026'),
            'role' => 'super',
        ]);
        User::create(['name' => '内容审核员', 'email' => 'review@ziwei.app', 'password' => bcrypt('ziwei2026'), 'role' => 'reviewer']);
        User::create(['name' => '运营小野', 'email' => 'ops@ziwei.app', 'password' => bcrypt('ziwei2026'), 'role' => 'operator']);

        $samples = [
            ['note', '今天在西湖边点了莲灯，心里安静了很多。', 'low', [['level' => 'low', 'word' => '莲灯']], 'approved'],
            ['wish', '愿家人平安，事业顺遂。', 'low', [], 'approved'],
            ['comment', '这签好准！转发给朋友了', 'mid', [['level' => 'mid', 'word' => '准']], 'rejected'],
            ['note', '加微信付费算命改运，包你逆天改命', 'high', [['level' => 'high', 'word' => '改运'], ['level' => 'high', 'word' => '逆天']], 'pending'],
            ['wish', '想暴富，求财神附体', 'mid', [['level' => 'mid', 'word' => '暴富']], 'whitelisted'],
        ];

        foreach ($samples as $i => [$type, $content, $risk, $hits, $status]) {
            ReviewItem::create([
                'content_type' => $type,
                'content' => $content,
                'author_id' => 1000 + $i,
                'censor_hits' => $hits,
                'risk_level' => $risk,
                'status' => $status,
            ]);
        }

        // 功德流水样本（末笔 1 分钟内 +900，用于演示异常预警）
        $rows = [
            ['user_id' => 2001, 'delta' => 120, 'reason' => 'dailyDeed', 'balance_after' => 120, 'days' => 10],
            ['user_id' => 2002, 'delta' => 120, 'reason' => 'dailyDeed', 'balance_after' => 320, 'days' => 8],
            ['user_id' => 2003, 'delta' => 200, 'reason' => 'checkin', 'balance_after' => 800, 'days' => 6],
            ['user_id' => 2004, 'delta' => 300, 'reason' => 'lot', 'balance_after' => 1500, 'days' => 4],
            ['user_id' => 2005, 'delta' => 500, 'reason' => 'invite', 'balance_after' => 2400, 'days' => 2],
            ['user_id' => 2006, 'delta' => 900, 'reason' => 'checkin', 'balance_after' => 3100, 'days' => 0],
        ];
        foreach ($rows as $r) {
            MeritTxn::create([
                'user_id' => $r['user_id'],
                'delta' => $r['delta'],
                'reason' => $r['reason'],
                'balance_after' => $r['balance_after'],
                'source' => 'miniprogram',
                'created_at' => now()->subDays($r['days']),
            ]);
        }

        AuditEntry::create([
            'actor_id' => $super->id,
            'action' => 'seed.init',
            'target_type' => User::class,
            'target_id' => (string) $super->id,
            'meta' => ['note' => '初始种子数据'],
        ]);

        // P1 演示数据
        $this->call([
            ProductSeeder::class,
            TourismSeeder::class,
            MetricSeeder::class,
        ]);
    }
}
