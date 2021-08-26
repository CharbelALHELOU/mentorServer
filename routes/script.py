import sys

argumants = sys.argv[1].split(",")

print(len(argumants))
sys.stdout.flush()

def stableMarriage(mentors, mentees, capacity):
	
	# make a copy of both mentors and mentees
	mentors_copy = {}
	for mentor in mentors:
		mentors_copy[str(mentor)] = []
		for mentee in mentors[mentor]:
			mentors_copy[str(mentor)].append(str(mentee))

	mentees_copy = {}
	for mentee in mentees:
		mentees_copy[str(mentee)] = []
		for mentor in mentees[mentee]:
			mentees_copy[str(mentee)].append(str(mentor))

	######################################################## maybe combine with mentor_temp too

	# final pairing set at the beginning before loop
	finalPairing = {}
	for mentor in mentors:
		finalPairing[mentor] = []

	# each loop is a single stable marriage
	while mentors: #while there are still mentees to match up

		# make a copy of both mentors and mentees
		mentors_temp = {}
		for mentor in mentors:
			mentors_temp[str(mentor)] = []
			for mentee in mentors[mentor]:
				mentors_temp[str(mentor)].append(str(mentee))

		mentees_temp = {}
		for mentee in mentees:
			mentees_temp[str(mentee)] = []
			for mentor in mentees[mentee]:
				mentees_temp[str(mentee)].append(str(mentor))


		# Let's do it so that the mentors get their favorites first
		# This means that the mentors have to propose to the mentees

		# mentees should have 'myself' as the last preference
		# if a mentee doesn't have a mentor to propse, they well have themselves
		for mentee in mentees_temp:
			mentees_temp[mentee].append('myself')

		# we also need to set up a list to keep track of which mentor has been matched
		# NEW IDEA: put in mentors who have been matched
		# mentors_matched = []

		# for mentor in mentors_temp:
		# 	mentors_picking.append(str(mentor))

		# we have the case of more mentors or more mentees
		# we just take the minimum of the mentors or mentors length and once 
		# there are enough stable matches to equal either value, we're done with the round

		mentee_preference = {}
		for mentee in mentees_temp:
			mentee_preference[str(mentee)] = 'myself'

		# while there exists a mentor who hasn't picked, keep proposing
		# uhh ignore this for now while len(mentors_matched) < min(len(mentors_temp), len(mentees_temp)):
		# while len(mentors_temp[mentors_temp.keys()[0]]):
		

		# STEP 1
		# have the mentors propose to the mentees
		for mentor in mentors_temp:
			if (len(finalPairing[mentor]) <= capacity[mentor] ):

				mentee_wanted = mentors_temp[mentor][0]

				# STEP 2
				# have the mentees pick the most liked mentor
				if mentees_temp[mentee_wanted].index(mentor) < mentees_temp[mentee_wanted].index(mentee_preference[mentee_wanted]):
					# Have to check if mentor is now the better mentor
					old_mentor=mentee_preference[mentee_wanted]
					mentee_preference[mentee_wanted]=mentor
					if old_mentor != 'myself':
						mentors_temp[old_mentor].remove(mentee_wanted)

				else:
					# STEP 3
					# have the mentors cross off mentees that rejected them 
					mentors_temp[mentor].remove(mentee_wanted)

		# now we know which mentees have mentors on a string, so all we have to do is 
		# Take out those mentees so that the next round mentors choose new mentees
		# and store the chosen mentees into finalPairing

		for mentee in mentee_preference:
			mentor = mentee_preference[mentee]
			# found a mentor mentee match! Yay
			if mentor != 'myself':
				finalPairing[mentor].append(mentee)
				mentees.pop(mentee)

				# we also have to remove the mentee from all mentor preferences list

				# we also have to remove mentors who have no more mentee preferences
				# Keep them in a list, then remove them after
				to_remove_mentors = []
				for mentor in mentors:
					if mentee in mentors[mentor]:
						mentors[mentor].remove(mentee)
					if not mentors[mentor]:
						to_remove_mentors.append(mentor)
				for mentor in to_remove_mentors:
					mentors.pop(mentor)




	for mentor in finalPairing:
		print(mentor + ' was paired with ' + str(finalPairing[mentor]) )

	matched_mentees = []
	for mentor in finalPairing:
		for mentee in finalPairing[mentor]:
			matched_mentees.append(mentee)
	unmatched_mentees = []
	for mentee in mentees_copy:
		if not mentee in matched_mentees:
			unmatched_mentees.append(mentee)

	print ('unmatched mentees ' + str(unmatched_mentees))
	print ('if a mentee was unmatched, that means no mentor had a preference for them')

if __name__ == '__main__':
	mentors = {}
	mentors['Jeff'] = ['Lucy', 'Ian', 'Tao', 'Francis', 'Jerry']
	mentors['Andrew'] = ['Lucy', 'Ian', 'Tao', 'Francis', 'Jerry']
	mentors['Chris'] = ['Lucy', 'Ian', 'Tao', 'Francis', 'Jerry']

	capacity = {}
	capacity['Jeff'] = 3
	capacity['Andrew'] = 3
	capacity['Chris'] = 3

	mentees = {}
	mentees['Tao'] = ['Chris', 'Jeff', 'Andrew']
	mentees['Francis'] = ['Chris', 'Jeff', 'Andrew']
	mentees['Lucy'] = ['Chris', 'Jeff', 'Andrew']
	mentees['Ian'] = ['Chris', 'Jeff', 'Andrew']
	mentees['Jerry'] = ['Chris', 'Andrew', 'Jeff']



	mentors2 = {}
	mentors2['Mentor1'] = ['Mentee1','Mentee2','Mentee3','Mentee4']
	mentors2['Mentor2'] = ['Mentee2','Mentee3','Mentee4','Mentee1']
	mentors2['Mentor3'] = ['Mentee3','Mentee4','Mentee1','Mentee2']
	mentors2['Mentor4'] = ['Mentee4','Mentee1','Mentee2','Mentee3']

	mentees2 = {}
	mentees2['Mentee1'] = ['Mentor1','Mentor2','Mentor3','Mentor4']
	mentees2['Mentee2'] = ['Mentor2','Mentor3','Mentor4','Mentor1']
	mentees2['Mentee3'] = ['Mentor3','Mentor4','Mentor1','Mentor2']
	mentees2['Mentee4'] = ['Mentor4','Mentor1','Mentor2','Mentor3']


	mentors3 = {}
	mentors3['Mentor1'] = ['Mentee1','Mentee2']
	mentors3['Mentor2'] = ['Mentee1','Mentee2']
	mentors3['Mentor3'] = ['Mentee2','Mentee1']
	mentors3['Mentor4'] = ['Mentee2','Mentee1']

	mentees3 = {}
	mentees3['Mentee1'] = ['Mentor1','Mentor2','Mentor3','Mentor4']
	mentees3['Mentee2'] = ['Mentor2','Mentor3','Mentor4','Mentor1']



	mentors4 = {}
	mentors4['Mentor1'] = ['Mentee1','Mentee2','Mentee3','Mentee4']
	mentors4['Mentor2'] = ['Mentee3','Mentee4','Mentee1','Mentee2']

	mentees4 = {}
	mentees4['Mentee1'] = ['Mentor1','Mentor2']
	mentees4['Mentee2'] = ['Mentor1','Mentor2']
	mentees4['Mentee3'] = ['Mentor1','Mentor2']
	mentees4['Mentee4'] = ['Mentor1','Mentor2']
	# stableMarriage(mentors4, mentees4)


	carDriver = {}
	carDriver['Jeff'] = ['Suhaas', 'Lynn', 'Ian']
	carDriver['Samir'] = ['Ian', 'Lucy', 'Yinning']
	carDriver['Jerry'] = ['Neha', 'Lynn', 'Richard']

	carRider = {}
	carRider['Yinning'] = ['Samir', 'Jerry', 'Jeff']
	carRider['Lucy'] = ['Samir', 'Jeff', 'Jerry']
	carRider['Lynn'] = ['Jeff', 'Jerry', 'Samir']
	carRider['Neha'] = ['Jerry', 'Jeff', 'Samir']
	carRider['Anusree'] = ['Jeff', 'Samir', 'Jerry']
	carRider['Suhaas'] = ['Jeff', 'Jerry', 'Samir']
	carRider['Mandy'] = ['Jerry', 'Samir', 'Jeff']
	carRider['Ashu'] = ['Samir', 'Jeff', 'Jerry']
	carRider['Kim'] = ['Jeff', 'Samir', 'Jerry']
	carRider['Andrew'] = ['Samir', 'Jerry', 'Jeff']
	carRider['Ian'] = ['Samir', 'Jerry', 'Jeff']
	carRider['Richard'] = ['Samir', 'Jerry', 'Jeff']

	#stableMarriage(mentors, mentees, capacity)

# need to figure out car shit
# implement ties
# implement necessary matches


# two cases: either group larger







# previous version

# def stableMarriage(mentors, mentees):
# 	finalPairing = {}
# 	for mentor in mentors:
# 		finalPairing[mentor] = []

# 	# Myself is the last option for everyone, no one wants to be lonely
# 		for preferences in mentees.values():
# 			preferences.append('myself')

# 	while mentees: #while there are still mentees to match up


# 		print mentees.keys()
# 		# Let's do it so that the mentors get their favorites first
# 		# This means that the mentors have to propose to the mentees
	
# 		# make a copy of mentors with same keys, vals set to None
# 		menteeChoices = mentees.fromkeys(mentees)
# 		# Fill the preferences up temporarily
# 		for mentee in mentees:
# 			menteeChoices[mentee] = 'myself'

# 		# make a copy of mentors too for future rounds
# 		thisRoundMentors = {}
# 		# make sure to only copy the primitive types
# 		for i in mentors:
# 			thisRoundMentors[i] = []
# 			for j in mentors[i]:
# 				thisRoundMentors[i].append(j)

# 		while len(thisRoundMentors.values()[0]): #while mentors still choosing
# 			for mentor in thisRoundMentors:
# 				tempMentee = thisRoundMentors[mentor].pop(0)

# 				# A check instead of removing in lines 46-48
# 				# if tempMentee not in mentees.keys():
# 				# 	continue

# 				# if the mentor is higher up in the mentee's preference list
# 				if (mentor in mentees[tempMentee]) and (mentees[tempMentee].index(mentor) < mentees[tempMentee].index(menteeChoices[tempMentee])) and (mentor not in menteeChoices.values()): 
# 					menteeChoices[tempMentee] = mentor

# 		for mentee in menteeChoices:
# 			if menteeChoices[mentee] != 'myself':
# 				finalPairing[menteeChoices[mentee]].append(mentee)
# 				mentees.pop(mentee)
# 				for mentor in mentors:
# 					if mentee in mentors[mentor]:
# 						mentors[mentor].remove(mentee)


# 	for mentor in finalPairing.keys():
# 		print mentor + ' was paired with: ' + str(finalPairing[mentor])


# if __name__ == '__main__':
# 	mentors = {}
# 	mentors['Jeff'] = ['Lucy', 'Ian', 'Tao']
# 	mentors['Andrew'] = ['Tao', 'Jerry', 'Lucy']
# 	mentors['Chris'] = ['Francis', 'Tao', 'Jerry']

# 	mentees = {}
# 	mentees['Tao'] = ['Chris', 'Jeff', 'Andrew']
# 	mentees['Francis'] = ['Chris', 'Andrew', 'Jeff']
# 	mentees['Lucy'] = ['Chris', 'Jeff', 'Andrew']
# 	mentees['Ian'] = ['Chris', 'Jeff', 'Andrew']
# 	mentees['Jerry'] = ['Chris', 'Andrew', 'Jeff']



# 	mentors2 = {}
# 	mentors2['Mentor1'] = ['Mentee1','Mentee2','Mentee3','Mentee4']
# 	mentors2['Mentor2'] = ['Mentee2','Mentee3','Mentee4','Mentee1']
# 	mentors2['Mentor3'] = ['Mentee3','Mentee4','Mentee1','Mentee2']
# 	mentors2['Mentor4'] = ['Mentee4','Mentee1','Mentee2','Mentee3']

# 	mentees2 = {}
# 	mentees2['Mentee1'] = ['Mentor1','Mentor2','Mentor3','Mentor4']
# 	mentees2['Mentee2'] = ['Mentor2','Mentor3','Mentor4','Mentor1']
# 	mentees2['Mentee3'] = ['Mentor3','Mentor4','Mentor1','Mentor2']
# 	mentees2['Mentee4'] = ['Mentor4','Mentor1','Mentor2','Mentor3']


# 	mentors3 = {}
# 	mentors3['Mentor1'] = ['Mentee1','Mentee2']
# 	mentors3['Mentor2'] = ['Mentee1','Mentee2']
# 	mentors3['Mentor3'] = ['Mentee2','Mentee1']
# 	mentors3['Mentor4'] = ['Mentee2','Mentee1']

# 	mentees3 = {}
# 	mentees3['Mentee1'] = ['Mentor1','Mentor2','Mentor3','Mentor4']
# 	mentees3['Mentee2'] = ['Mentor2','Mentor3','Mentor4','Mentor1']



# 	mentors4 = {}
# 	mentors4['Mentor1'] = ['Mentee1','Mentee2','Mentee3','Mentee4']
# 	mentors4['Mentor2'] = ['Mentee3','Mentee4','Mentee1','Mentee2']

# 	mentees4 = {}
# 	mentees4['Mentee1'] = ['Mentor1','Mentor2']
# 	mentees4['Mentee2'] = ['Mentor1','Mentor2']
# 	mentees4['Mentee3'] = ['Mentor1','Mentor2']
# 	mentees4['Mentee4'] = ['Mentor1','Mentor2']



# 	carDriver = {}
# 	carDriver['Jeff'] = ['Suhaas', 'Lynn', 'Ian']
# 	carDriver['Samir'] = ['Ian', 'Lucy', 'Yinning']
# 	carDriver['Jerry'] = ['Neha', 'Lynn', 'Richard']

# 	carRider = {}
# 	carRider['Yinning'] = ['Samir', 'Jerry', 'Jeff']
# 	carRider['Lucy'] = ['Samir', 'Jeff', 'Jerry']
# 	carRider['Lynn'] = ['Jeff', 'Jerry', 'Samir']
# 	carRider['Neha'] = ['Jerry', 'Jeff', 'Samir']
# 	carRider['Anusree'] = ['Jeff', 'Samir', 'Jerry']
# 	carRider['Suhaas'] = ['Jeff', 'Jerry', 'Samir']
# 	carRider['Mandy'] = ['Jerry', 'Samir', 'Jeff']
# 	carRider['Ashu'] = ['Samir', 'Jeff', 'Jerry']
# 	carRider['Kim'] = ['Jeff', 'Samir', 'Jerry']
# 	carRider['Andrew'] = ['Samir', 'Jerry', 'Jeff']
# 	carRider['Ian'] = ['Samir', 'Jerry', 'Jeff']
# 	carRider['Richard'] = ['Samir', 'Jerry', 'Jeff']

# 	stableMarriage(carDriver, carRider)

# # need to figure out car shit
# # implement ties
# # implement necessary matches


# # two cases: either group larger










