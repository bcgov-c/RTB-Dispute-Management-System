using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class SeedExcludedWords : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"INSERT INTO public.""AccessCodeExcludeWords"" (""ExcludeWord"") VALUES
                ('a55') , ('anal'), ('anl'), ('anus'), ('arse'), ('ass'), ('bag'), ('ball'), ('bals'), ('balz'), ('bang'), ('barf'), ('bbw'), ('bdsm'), ('beer'), ('bich'), ('bitch'),
                ('bj'), ('bone'), ('bong'), ('boob'), ('bra'), ('bum'), ('bung'), ('busty'), ('butt'), ('cl1t'), ('clit'), ('cock'), ('cok'), ('coks'), ('coon'), ('crack'), ('crak'),
                ('cum'), ('cunt'), ('d1c'), ('die'), ('dik'), ('dix'), ('dong'), ('dyk'), ('fag'), ('fart'), ('fat'), ('felch'), ('fist'), ('foad'), ('frig'), ('fubar'), ('fuck'),
                ('fuk'), ('fux'), ('fvc'), ('gay'), ('gey'), ('ghay'), ('ghey'), ('glans'), ('gook'), ('gtfo'), ('gzz'), ('he11'), ('hell'), ('hemp'), ('herp'), ('hiv'), ('homo'),
                ('hoor'), ('hump'), ('injun'), ('j3rk'), ('jap'), ('jerk'), ('jew'), ('jism'), ('jiz'), ('jugs'), ('jugz'), ('kike'), ('kill'), ('kkk'), ('kok'), ('kum'), ('kunt'),
                ('labia'), ('lech'), ('leper'), ('lesbo'), ('lez'), ('lick'), ('lik'), ('lmao'), ('lsd'), ('lube'), ('lust'), ('mams'), ('maxi'), ('meth'), ('milf'), ('mlf'),
                ('mofo'), ('muff'), ('nad'), ('nard'), ('nazi'), ('nig'), ('nimf'), ('nip'), ('nob'), ('nude'), ('oral'), ('org'), ('ovary'), ('ovum'), ('paki'), ('pcp'), ('pedo'),
                ('pee'), ('penis'), ('pimp'), ('piss'), ('pms'), ('poof'), ('poon'), ('porn'), ('pot'), ('pssy'), ('pub'), ('pube'), ('puss'), ('puto'),  ('racy'), ('rak'), ('rape'),
                ('rect'), ('rim'), ('rod'), ('rump'), ('ruski'), ('sac'), ('sak'), ('scag'), ('screw'), ('scum'), ('semen'), ('sex'), ('sh1t'), ('shit'), ('shiz'), ('sht'), ('skag'),
                ('slut'), ('smut'), ('sob'), ('spic'), ('spik'), ('stfu'), ('stif'), ('suck'), ('suk'), ('sxy'), ('t1t'), ('t1t'), ('tard'), ('teat'), ('teste'), ('thug'), ('tit'),
                ('toke'), ('tush'), ('twat'), ('ugly'), ('urin'), ('uzi'), ('vag'), ('vaj'), ('wad'), ('wang'), ('wank'), ('weed'), ('wench'), ('whiz'), ('wiz'), ('womb'), ('wop'),
                ('wtf'), ('xx'), ('xxx'), ('yobb')");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM public.""AccessCodeExcludeWords""");
        }
    }
}
