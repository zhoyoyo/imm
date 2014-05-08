library(plyr)
library(ggplot2)
library(reshape)

#library(gridExtra)
#library(qdap)
#install.packages('gridExtra')
#install.packages('qdap')

imm <- read.csv('imm.csv',header=TRUE,stringsAsFactors=FALSE)
imm <- subset(imm,initial <500)
imm <- imm[order(imm$year,-imm$initial),]
head(imm,10)

imm <- cast(imm,title+service_center~year,value=c('initial'))

write.table(imm,file="data.csv",col.names=TRUE,row.names=FALSE,sep=",")




ggplot(imm,aes(x=job.title,y=initial.application))+
geom_bar(stat='identity')+
coord_flip()+
facet_grid(~year)


ggplot(imm,aes(x=year,y=initial.application))+
geom_area(fill='grey')+
facet_wrap(~job.title)



for (i in 1:nrow(team)) {
	if (word_count(team$Franchise[i])==2) {team$Franchise_short[i] =strsplit(team$Franchise[i],' ')[[1]][2]}
	if (word_count(team$Franchise[i])==3) {team$Franchise_short[i] =strsplit(team$Franchise[i],' ')[[1]][3]}
	if (word_count(team$Franchise[i])==5) {team$Franchise_short[i] =strsplit(team$Franchise[i],' ')[[1]][5]}
	}

## Best Franchise of the year
bestTeams <- ddply(team,.(Year,Lg),transform,maxWpct=max(Wpct))
bestTeams <- subset(bestTeams, Wpct == maxWpct)
bestTeamAl <- subset(bestTeams,Lg=='AL')
bestTeamNl <- subset(bestTeams,Lg=='NL')

## WorldSeries
WSTeams <- subset(team,Playoffs =='Won_WS ' | Playoffs=='Lost_WS ')
W_WSTeams <- subset(WSTeams,Playoffs=='Won_WS ')
L_WSTeams <- subset(WSTeams,Playoffs=='Lost_WS ')
NL_WSTeams <- subset(WSTeams, Lg=='NL')
AL_WSTeams <- subset(WSTeams, Lg=='AL')
NL_W_WSTeams <- subset(NL_WSTeams, Playoffs=='Won_WS ')
AL_W_WSTeams <- subset(AL_WSTeams, Playoffs=='Won_WS ')
NL_L_WSTeams <- subset(NL_WSTeams, Playoffs=='Lost_WS ')
AL_L_WSTeams <- subset(AL_WSTeams, Playoffs=='Lost_WS ')

## By League
ALteams <- subset(team,Lg=='AL')
NLteams <- subset(team,Lg=='NL')



# process world series games
ws <- read.csv('GLWS.csv',header=T)
ws$year <- as.numeric(substring(ws$date,1,4))

ws <- ws[c('date','year','visiting.team','visiting.team.league','home.team','home.team.league','home.team.score','visiting.team.score')]

for (i in 1:nrow(ws)) {
	
	ws$middle[1] =1
	
	if (ws$visiting.team.score[i] > ws$home.team.score[i]) {
		ws$w_game[i] = as.character(ws$visiting.team[i])
	}
	else {
		ws$w_game[i] = as.character(ws$home.team[i])
	}
	
	
	if (i==1) {
		ws$middle[i] =1
		ws$game.number[i]=1
	}
	else {
		if (ws$year[i] > ws$year[i-1]) {##IF THE YEAR CHANGES
			ws$middle[i] = 1
			ws$game.number[i] = 1
		} else {
			ws$game.number[i] =ws$game.number[i-1]+1
			if (ws$w_game[i] == ws$w_game[i-1]) {ws$middle[i] = ws$middle[i-1]}
			else {
				if (ws$middle[i-1] == 0) {ws$middle[i] = 1}
				else {ws$middle[i] = 0}
			}
		}
	}
}

ws <- ddply(ws, .(year),transform,middle_total = sum(middle))

for (i in 1:nrow(ws)) {
	if (ws$middle_total[i] < 4) {
		if (ws$middle[i] ==1) {ws$w_ws[i]=NA }
		else {ws$w_ws[i]=ws$w_game[i]} 
	}
	else {
		if (ws$middle[i] ==1) {ws$w_ws[i]=ws$w_game[i]} 
		else {ws$w_ws[i]=NA}
	}
}
ws_win <- subset(ws,w_game==w_ws)




### GAME PER GAME STATS
allTeam <- read.csv('ALL.csv',header=TRUE,stringsAsFactors=FALSE)
allTeam$year <- as.numeric(substring(allTeam$date,1,4))
battingStat <- read.csv('LgBattingTotals.csv',header=T,stringsAsFactors=F)

stat <- allTeam[c('year','at.bats_H','at.bats_V','hits_H','hits_V','homeruns_H','homeruns_V','stolenbases_H','stolenbases_V','RBI_H','RBI_V','strikeouts_H','strikeouts_V','left.on.base_H','left.on.base_V','team.earned.runs_H','team.earned.runs_V','errors_H','errors_V','walks_H','walks_V')]

stat <- ddply(stat,.(year),transform,runs=team.earned.runs_H+team.earned.runs_V,errors=errors_H+errors_V,left.on.base=left.on.base_H+left.on.base_V,homeruns=homeruns_H+homeruns_V,stolenbases=stolenbases_V+stolenbases_H,strikeouts=strikeouts_V+strikeouts_H,hits=hits_V+hits_H,walks=walks_V+walks_H)

statPerYear <- ddply(stat,c("year"),summarise,
	runs=mean(runs, na.rm=TRUE),
	errors=mean(errors, na.rm=TRUE),
	strikeouts=mean(strikeouts, na.rm=TRUE),
	homeruns=mean(homeruns, na.rm=TRUE),
	hits=mean(hits, na.rm=TRUE),
	walks=mean(walks, na.rm=TRUE),
	stolenbases=mean(stolenbases, na.rm=TRUE))




sizeFactor = 1.5



pteam <-
ggplot(data=team,aes(x=Year))+
geom_path(data=NLteams, aes(y=(Wpct-0.6), color=Franchise,alpha=abs(Wpct-0.5),size=abs(Wpct-0.5)),lineend='round',linejoin='round')+
geom_path(data=ALteams, aes(y=Wpct,color=Franchise,alpha=abs(Wpct-0.5),size=abs(Wpct-0.5)),lineend='round',linejoin='round')+
scale_size_continuous(range=c(0.25*sizeFactor,0.5*sizeFactor))+

## Best Teams
geom_rect(data = bestTeamAl, aes(xmin=Year-0.1,xmax=Year+0.1,ymin=0.8,ymax=1.1),color='grey50',fill=NA,size=0.1)+
#geom_rect(data = bestTeamAl, aes(xmin=Year-0.1,xmax=Year+0.1,ymin=0.8,ymax=0.8+maxWpct/3),color='grey70',fill='grey50',size=0.1)+
geom_rect(data = bestTeamNl, aes(xmin=Year-0.1,xmax=Year+0.1,ymin=1.1,ymax=1.4),color='grey50',fill=NA,size=0.1)+
ylim(c(-.4,6.5))+
#geom_rect(data = bestTeamNl, aes(xmin=Year-0.1,xmax=Year+0.1,ymin=1.1,ymax=1.1+maxWpct/3),color='grey70',fill='grey50',size=0.1)+
geom_text(data=bestTeamNl,aes(x=Year,y=0.8,label=Franchise_short,hjust=0),size=1*sizeFactor,color='white')+
geom_text(data=bestTeamNl,aes(x=Year+0.3,y=0.8,label=round(maxWpct,digits=3),hjust=0),size=1*sizeFactor,color='white')+
geom_text(data=bestTeamAl,aes(x=Year,y=1.1,label=Franchise_short,hjust=0),size=1*sizeFactor,color='white')+
geom_text(data=bestTeamAl,aes(x=Year+0.3,y=1.1,label=round(maxWpct,digits=3),hjust=0),size=1*sizeFactor,color='white')+

#WS Teams
geom_text(data=NL_W_WSTeams,aes(x=Year,y=1.4,label=Franchise_short,hjust=0),color='white',fontface='bold',size=1*sizeFactor)+
geom_text(data=AL_W_WSTeams,aes(x=Year,y=1.7,label=Franchise_short,hjust=0),color='white',fontface='bold',size=1*sizeFactor)+
geom_text(data=NL_L_WSTeams,aes(x=Year,y=1.4,label=Franchise_short,hjust=0),color='#cccccc',fontface='plain',size=1*sizeFactor)+
geom_text(data=AL_L_WSTeams,aes(x=Year,y=1.7,label=Franchise_short,hjust=0),color='#cccccc',fontface='plain',size=1*sizeFactor)+

## WS Teams games
geom_point(data=ws,aes(x=year+0.3,y=1.35+(game.number)/15),size=0.8*sizeFactor,shape=21,color='grey50',fill=NA)+
geom_point(data=ws_win,aes(x=year+0.3,y=1.35+(game.number)/15),size=0.8*sizeFactor,shape=21,fill='grey80',color=NA)+

## Stats per game
##  hits per game
#geom_ribbon(data=battingStat,aes(x=Year,ymin=2.2,ymax=2.2+H_G/2),alpha=0.5,fill='white',size=0.3*sizeFactor)+
##  walks per game
geom_ribbon(data=statPerYear,aes(x=year,ymin=2.2,ymax=2.2+walks/2),alpha=0.3,fill='white',size=0.3*sizeFactor)+
geom_text(data=data.frame(cbind(x=1915,y=4.8)),aes(x=x,y=y,label='Walks/G',hjust=0),color='white',size=1*sizeFactor)+
#runs per game
geom_ribbon(data=battingStat,aes(x=Year,ymin=2.2,ymax=2.2+RPG/2),alpha=0.5,fill='green',size=0.3*sizeFactor)+
geom_text(data=data.frame(cbind(x=1901,y=4.2)),aes(x=x,y=y,label='Runs/G',hjust=0),color='white',size=1*sizeFactor)+
##  SO per game
geom_ribbon(data=battingStat,aes(x=Year,ymin=2.2,ymax=2.2+SOG/2),alpha=0.5,fill='purple',size=0.3*sizeFactor)+
geom_text(data=data.frame(cbind(x=1901,y=3)),aes(x=x,y=y,label='Strikeouts/G',hjust=0),color='white',size=1*sizeFactor)+
#errors
geom_ribbon(data=statPerYear,aes(x=year,ymin=2.2,ymax=2.2+errors/4),alpha=0.5,fill='red',size=0.3*sizeFactor)+
geom_text(data=data.frame(cbind(x=1915,y=2.9)),aes(x=x,y=y,label='Errors/G',hjust=0),color='white',size=1*sizeFactor)+
#homeruns per game
geom_ribbon(data=battingStat,aes(x=Year,ymin=2.2,ymax=2.2+HR_G/2),alpha=0.6,fill='white',size=0.3*sizeFactor)+
geom_text(data=data.frame(cbind(x=1901,y=2.2)),aes(x=x,y=y,label='Homeruns/G',hjust=0),color='white',size=1*sizeFactor)+
## StolenBases
geom_ribbon(data=battingStat,aes(x=Year,ymin=2.2,ymax=2.2+SB_G/2),alpha=0.6,fill='orange',size=0.3*sizeFactor)+
geom_text(data=data.frame(cbind(x=1912,y=2.4)),aes(x=x,y=y,label='Stolenbases/G',hjust=0),color='white',size=1*sizeFactor)+
#baseline
geom_line(data=battingStat,aes(x=Year,y=2.2),color='white',size=0.3*sizeFactor)+


coord_flip()+
scale_x_reverse()+
theme(aspect.ratio=4,panel.background=element_rect(fill='black'),axis.line.x=element_line(color='black'),panel.grid.major=element_line(color='grey20'),panel.grid.minor=element_line(color='grey20'),panel.margin=unit(0,'cm'),axis.title=element_blank())

#onesheet <- grid.arrange(p_ratio,p_BA,p_HR,p_SB,p_RBI,ncol=1)
ggsave(pteam,file='history.pdf',width=22,height=22)


